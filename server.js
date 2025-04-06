import { createServer } from "node:https";
import next from "next";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import mediasoup from "mediasoup";
import { add } from "date-fns";
import { server } from "typescript";

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
  let rooms = {};
  let peers = {};
  let transports = [];
  let producers = [];
  let consumers = [];

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
    socket.on("ready", () => {
      console.log("peer is ready");
      socket.emit("connection-success", {
        socketId: socket.id,
      });
    });
    const removeItem = (items, socketId, type) => {
      items.forEach((item) => {
        if (item.socketId === socket.id) {
          item[type].close();
        }
      });
      items = items.filter((item) => item.socketId !== socket.id);
      return items;
    };
    socket.on("disconnect", () => {
      console.log("peer disconnected");
      consumers = removeItem(consumers, socket.id, "consumer");
      transports = removeItem(transports, socket.id, "transport");
      producers = removeItem(producers, socket.id, "producer");
      const { roomName } = peers[socket.id];
      delete peers[socket.id];

      rooms[roomName] = {
        router: rooms[roomName].router,
        peers: rooms[roomName].peers.filter(
          (socketId) => socketId !== socket.id
        ),
      };
    });

    socket.on("join-room", async ({ roomName }, callback) => {
      console.log("join room", roomName);
      const router1 = await createRoom(roomName, socket.id);
      peers[socket.id] = {
        socket,
        roomName,
        transports: [],
        producers: [],
        consumers: [],
        peerDetails: {
          name: "",
          isAdmin: false,
        },
      };
      const rtpCapabilities = router1.rtpCapabilities;
      callback({ rtpCapabilities });
    });

    const createRoom = async (roomName, socketId) => {
      let router1;
      let peers = [];
      if (rooms[roomName]) {
        router1 = rooms[roomName].router;
        peers = rooms[roomName].peers || [];
      } else {
        router1 = await worker.createRouter({ mediaCodecs });
      }
      console.log("router id", router1.id, peers.length);
      rooms[roomName] = {
        router: router1,
        peers: [...peers, socketId],
      };
      return router1;
    };

    socket.on("createWebRtcTransport", async ({ consumer }, callback) => {
      const roomName = peers[socket.id].roomName;
      const router = rooms[roomName].router;

      try {
        const transport = await createWebRtcTransport(router);
        callback({
          params: {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters,
          },
        });
        addTransport(transport, roomName, consumer);
      } catch (error) {
        console.log(error);
      }
    });

    const addTransport = (transport, roomName, consumer) => {
      transports = [
        ...transports,
        {
          roomName,
          transport,
          socketId: socket.id,
          consumer,
        },
      ];
      peers[socket.id] = {
        ...peers[socket.id],
        transports: [...peers[socket.id].transports, transport.id],
      };
    };
    const addProducer = (producer, roomName) => {
      producers = [
        ...producers,
        {
          roomName,
          producer,
          socketId: socket.id,
        },
      ];
      peers[socket.id] = {
        ...peers[socket.id],
        producers: [...peers[socket.id].producers, producer.id],
      };
    };
    const addConsumer = (consumer, roomName) => {
      consumers = [
        ...consumers,
        {
          roomName,
          consumer,
          socketId: socket.id,
        },
      ];
      peers[socket.id] = {
        ...peers[socket.id],
        consumers: [...peers[socket.id].consumers, consumer.id],
      };
    };
    socket.on("getProducers", (callback) => {
      const { roomName } = peers[socket.id];
      let producerList = [];
      producers.forEach((producerData) => {
        if (
          producerData.socketId !== socket.id &&
          producerData.roomName === roomName
        ) {
          producerList = [...producerList, producerData.producer.id];
        }
      });
      callback(producerList);
    });
    const informConsumers = (roomName, socketId, id) => {
      producers.forEach((producerData) => {
        if (
          producerData.socketId !== socketId &&
          producerData.roomName === roomName
        ) {
          const producerSocket = peers[producerData.socketId].socket;
          producerSocket.emit("new-producer", { producerId: id });
        }
      });
    };
    const getTransport = (socketId) => {
      const [producerTransport] = transports.filter(
        (transport) => transport.socketId === socketId && !transport.consumer
      );
      return producerTransport.transport;
    };
    socket.on("transport-connect", ({ dtlsParameters }) => {
      console.log("DTLS parameters", { dtlsParameters });
      getTransport(socket.id).connect({ dtlsParameters });
    });
    socket.on(
      "transport-produce",
      async ({ kind, rtpParameters, appData }, callback) => {
        const producer = await getTransport(socket.id).produce({
          kind,
          rtpParameters,
        });

        const { roomName } = peers[socket.id];

        addProducer(producer, roomName);

        informConsumers(roomName, socket.id, producer.id);

        producer.on("transportclose", () => {
          console.log("transport closed");
          producer.close();
        });
        callback({
          id: producer.id,
          producersExist: producers.length > 1 ? true : false,
        });
      }
    );
    socket.on(
      "transport-recv-connect",
      async ({ dtlsParameters, serverConsumerTransportId }) => {
        console.log(`DTLS PARAMS: ${dtlsParameters}`);
        const consumerTransport = transports.find(
          (transportData) =>
            transportData.consumer &&
            transportData.transport.id == serverConsumerTransportId
        ).transport;
        await consumerTransport.connect({ dtlsParameters });
      }
    );
    socket.on(
      "consume",
      async (
        { rtpCapabilities, remoteProducerId, serverConsumerTransportId },
        callback
      ) => {
        try {
          const { roomName } = peers[socket.id];
          const router = rooms[roomName].router;
          let consumerTransport = transports.find(
            (transportData) =>
              transportData.consumer &&
              transportData.transport.id === serverConsumerTransportId
          ).transport;

          if (
            router.canConsume({ producerId: remoteProducerId, rtpCapabilities })
          ) {
            const consumer = await consumerTransport.consume({
              producerId: remoteProducerId,
              rtpCapabilities,
              paused: true,
            });
            consumer.on("transportclose", () => {
              console.log("transport closed from consumer");
            });
            consumer.on("producerclose", () => {
              console.log("producer of consumer closed");
              socket.emit("producer-closed", { remoteProducerId });
              consumerTransport.close([]);
              transports = transports.filter(
                (transportData) =>
                  transportData.transport.id !== consumerTransport.id
              );
              consumer.close();
              consumers = consumers.filter(
                (consumerData) => consumerData.consumer.id !== consumer.id
              );
            });
            addConsumer(consumer, roomName);
            const params = {
              id: consumer.id,
              producerId: remoteProducerId,
              kind: consumer.kind,
              rtpParameters: consumer.rtpParameters,
              serverConsumerId: consumer.id,
            };
            callback({
              params,
            });
          }
        } catch (error) {
          console.error("consume error:", error);
          callback({ params: { error } });
        }
      }
    );
    socket.on("consumer-resume", async ({ serverConsumerId }) => {
      console.log("consumer resume");
      const { consumer } = consumers.find(
        (consumerData) => consumerData.consumer.id === serverConsumerId
      );
      console.log("consumer ", consumer);
      await consumer.resume();
    });
    const createWebRtcTransport = async (router) => {
      return new Promise(async (resolve, reject) => {
        try {
          // https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
          const webRtcTransport_options = {
            listenIps: [
              {
                ip: "0.0.0.0", // replace with relevant IP address
                announcedIp: "10.0.0.115",
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

          resolve(transport);
        } catch (error) {
          reject(error);
        }
      });
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
