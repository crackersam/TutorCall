import { createServer } from "node:https";
import next from "next";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import mediasoup from "mediasoup";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();
const __dirname = path.resolve();
const options = {
  key: fs.readFileSync(path.resolve(__dirname, "ssl", "key.pem")),
  cert: fs.readFileSync(path.resolve(__dirname, "ssl", "cert.pem")),
};

app.prepare().then(() => {
  const httpsServer = createServer(options, handler);

  const io = new Server(httpsServer);
  const twoPeers = io.of("/two-peers");

  let worker;
  let router;
  let producerTransport;
  let consumerTransport;
  let producer;
  let consumer;

  const createWorker = async () => {
    worker = await mediasoup.createWorker({
      rtgMinPort: 2000,
      rtgMaxPort: 2020,
    });
    console.log(`worker pid ${worker.pid}`);
    worker.on("died", (error) => {
      console.error("mediasoup worker died", error);
      setTimeout(() => {
        process.exit(1);
      }, 2000);
      return worker;
    });
  };
  worker = createWorker();
  const mediaCodecs = [
    {
      kind: "audio",
      mimeType: "audio/opus",
      clockRate: 48000,
      channels: 2,
    },
    {
      kind: "video",
      mimeType: "video/VP8",
      clockRate: 90000,
      parameters: {
        "x-google-start-bitrate": 1000,
      },
    },
  ];

  twoPeers.on("connection", async (socket) => {
    console.log(socket.id);
    socket.emit("connection-success", {
      socketId: socket.id,
      existsProducer: producer ? true : false,
    });
    socket.on("disconnect", () => {
      console.log("peer disconnected");
    });

    socket.on("create-room", async (callback) => {
      if (router === undefined) {
        router = await worker.createRouter({ mediaCodecs });
        console.log("router id", router.id);
      }
      getRtpCapabilities(callback);
    });

    const getRtpCapabilities = (callback) => {
      const rtpCapabilities = router.rtpCapabilities;

      callback({ rtpCapabilities });
    };

    socket.on("createWebRtcTransport", async ({ sender }, callback) => {
      console.log("is this a sender request?", sender);
      if (sender) {
        producerTransport = await createWebRtcTransport(callback);
      } else {
        consumerTransport = await createWebRtcTransport(callback);
      }
    });
    socket.on("transport-connect", async ({ dtlsParameters }) => {
      console.log("DTLS parameters", { dtlsParameters });
      await producerTransport.connect({ dtlsParameters });
    });
    socket.on(
      "transport-produce",
      async ({ kind, rtpParameters, appData }, callback) => {
        producer = await producerTransport.produce({ kind, rtpParameters });

        producer.on("transportclose", () => {
          console.log("transport closed");
          producer.close();
        });
        callback({
          id: producer.id,
        });
      }
    );
    socket.on("transport-recv-connect", async ({ dtlsParameters }) => {
      console.log("DTLS parameters", { dtlsParameters });
      await consumerTransport.connect({ dtlsParameters });
    });
    socket.on("consume", async ({ rtpCapabilities }, callback) => {
      try {
        if (router.canConsume({ producerId: producer.id, rtpCapabilities })) {
          consumer = await consumerTransport.consume({
            producerId: producer.id,
            rtpCapabilities,
            paused: true,
          });
          consumer.on("transportclose", () => {
            console.log("transport closed from consumer");
          });
          consumer.on("producerclose", () => {
            console.log("producer of consumer closed");
          });
          const params = {
            id: consumer.id,
            producerId: producer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
          };
          callback({
            params,
          });
        }
      } catch (error) {
        console.error("consume error:", error);
        callback({ params: { error } });
      }
    });
    socket.on("consumer-resume", async () => {
      console.log("consumer resume");
      await consumer.resume();
    });
    const createWebRtcTransport = async (callback) => {
      try {
        // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
        const webRtcTransport_options = {
          listenIps: [
            {
              ip: "0.0.0.0", // replace with relevant IP address
              announcedIp: "127.0.0.1",
            },
          ],
          enableUdp: true,
          enableTcp: true,
          preferUdp: true,
        };

        // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
        let transport = await router.createWebRtcTransport(
          webRtcTransport_options
        );
        console.log(`transport id: ${transport.id}`);

        transport.on("dtlsstatechange", (dtlsState) => {
          if (dtlsState === "closed") {
            transport.close();
          }
        });

        transport.on("close", () => {
          console.log("transport closed");
        });

        // send back to the client the following prameters
        callback({
          // https://mediasoup.org/documentation/v3/mediasoup-client/api/#TransportOptions
          params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          },
        });

        return transport;
      } catch (error) {
        console.log(error);
        callback({
          params: {
            error: error,
          },
        });
      }
    };
  });

  httpsServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
