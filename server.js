import { createServer } from "node:https";
import next from "next";
import { Server } from "socket.io";
import fs from "fs";
import path from "path";
import mediasoup from "mediasoup";
import config from "./server-lib/config.js";
import createWorkers from "./server-lib/createWorkers.js";
import Client from "./server-lib/classes/Client.js";
import Room from "./server-lib/classes/Room.js";
import getWorker from "./server-lib/getWorker.js";
import updateActiveSpeakers from "./server-lib/updateActiveSpeakers.js";

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
  const twoPeers = io.of("/");

  let workers = null;
  let theProducer = null;
  let rooms = [];

  const initMediasoup = async () => {
    workers = await createWorkers();
  };

  initMediasoup();

  twoPeers.on("connection", async (socket) => {
    socket.on("connected", async () => {
      console.log("connected");
      socket.emit("connected");
    });
    let handshake = socket.handshake;
    let client;
    socket.on("joinRoom", async ({ userName, roomName }, ackCb) => {
      let newRoom = false;
      client = new Client(userName, socket);
      let requestedRoom = rooms.find((room) => room.roomName === roomName);
      if (!requestedRoom) {
        newRoom = true;
        // make the new room, add a worker, add a router
        const workerToUse = await getWorker(workers);
        requestedRoom = new Room(roomName, workerToUse);
        await requestedRoom.createRouter(io);
        rooms.push(requestedRoom);
      }
      // add the room to the client
      client.room = requestedRoom;
      // add the client to the Room clients
      client.room.addClient(client);
      // add this socket to the socket room
      socket.join(client.room.roomName);

      //fetch the first 0-5 pids in activeSpeakerList
      const audioPidsToCreate = client.room.activeSpeakerList.slice(0, 5);
      //find the videoPids and make an array with matching indicies
      // for our audioPids.
      const videoPidsToCreate = audioPidsToCreate.map((aid) => {
        const producingClient = client.room.clients.find(
          (c) => c?.producer?.audio?.id === aid
        );
        return producingClient?.producer?.video?.id;
      });
      //find the username and make an array with matching indicies
      // for our audioPids/videoPids.
      const associatedUserNames = audioPidsToCreate.map((aid) => {
        const producingClient = client.room.clients.find(
          (c) => c?.producer?.audio?.id === aid
        );
        return producingClient?.userName;
      });

      ackCb({
        routerRtpCapabilities: client.room.router.rtpCapabilities,
        newRoom,
        audioPidsToCreate,
        videoPidsToCreate,
        associatedUserNames,
      });
    });
    socket.on("requestTransport", async ({ type, audioPid }, ackCb) => {
      let clientTransportParams = null;
      if (type === "producer") {
        clientTransportParams = await client.addTransport(type);
      } else if (type === "consumer") {
        const producingClient = client.room.clients.find((c) => {
          return c?.producer?.audio?.id === audioPid;
        });
        const videoPid = producingClient?.producer?.video?.id;

        clientTransportParams = await client.addTransport(
          type,
          audioPid,
          videoPid
        );
      }
      ackCb(clientTransportParams);
    });
    socket.on(
      "connectTransport",
      async ({ dtlsParameters, type, audioPid }, ackCb) => {
        if (type === "producer") {
          try {
            await client.upstreamTransport.connect({ dtlsParameters });
            ackCb("success");
          } catch (err) {
            console.log("Error connecting transport");
            console.log(err);
            ackCb("error");
          }
        } else if (type === "consumer") {
          try {
            const downstreamTransport = client.downstreamTransports.find(
              (t) => {
                return t.associatedAudioPid === audioPid;
              }
            );
            downstreamTransport.transport.connect({ dtlsParameters });
            ackCb("success");
          } catch (err) {
            console.log(err);
            ackCb("error");
          }
        }
      }
    );
    socket.on("startProducing", async ({ kind, rtpParameters }, ackCb) => {
      try {
        const newProducer = await client.upstreamTransport.produce({
          kind,
          rtpParameters,
        });
        client.addProducer(kind, newProducer);
        if (kind === "audio") {
          client.room.activeSpeakerList.push(newProducer.id);
        }
        ackCb(newProducer.id);
      } catch (err) {
        console.log("Error producing");
        console.log(err);
        ackCb(err);
      }
      const newTraansportsByPeer = updateActiveSpeakers(client.room, io);
      for (const [socketId, audioPidsToCreate] of Object.entries(
        newTraansportsByPeer
      )) {
        const videoPidsToCreate = audioPidsToCreate.map((aid) => {
          const produocerClient = client.room.clients.find(
            (c) => c?.producer?.audio?.id === aid
          );
          return produocerClient?.producer?.video?.id;
        });
        const associatedUserNames = audioPidsToCreate.map((aid) => {
          const producingClient = client.room.clients.find(
            (c) => c?.producer?.audio?.id === aid
          );
          return producingClient?.userName;
        });
        io.to(socketId).emit("newProducersToConsume", {
          routerRtpCapabilities: client.room.router.rtpCapabilities,
          audioPidsToCreate,
          videoPidsToCreate,
          associatedUserNames,
          activeSpeakerList: client.room.activeSpeakerList.slice(0, 5),
        });
      }
    });
    socket.on("audioChange", (typeOfChange) => {
      if (typeOfChange === "mute") {
        client?.producer?.audio?.pause();
      } else if (typeOfChange === "unmute") {
        client?.producer?.audio?.resume();
      }
    });
    socket.on("consumeMedia", async ({ rtpCapabilities, pid, kind }, ackCb) => {
      console.log(`kind is ${kind}     pid is ${pid}`);
      try {
        if (
          !client.room.router.canConsume({ producerId: pid, rtpCapabilities })
        ) {
          console.log("Cannot consume");
          ackCb("cannotConsume");
        } else {
          const downstreamTransport = client.downstreamTransports.find((t) => {
            if (kind === "audio") {
              return t.associatedAudioPid === pid;
            } else if (kind === "video") {
              return t.associatedVideoPid === pid;
            }
          });
          const newConsumer = await downstreamTransport.transport.consume({
            producerId: pid,
            rtpCapabilities,
            paused: true,
          });
          // add the consumer to the client
          client.addConsumer(kind, newConsumer, downstreamTransport);

          const clientParams = {
            producerId: pid,
            id: newConsumer.id,
            kind: newConsumer.kind,
            rtpParameters: newConsumer.rtpParameters,
          };
          ackCb(clientParams);
        }
      } catch (error) {
        console.log(error);
        ackCb("consumeFailed");
      }
    });
    socket.on("unpauseConsumer", async ({ pid, kind }, ackCb) => {
      const consumerToResume = client.downstreamTransports.find((t) => {
        return t?.[kind].producerId === pid;
      });
      try {
        await consumerToResume[kind].resume();
        ackCb();
      } catch (err) {
        console.log(err);
        ackCb();
      }
    });
  });

  httpsServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(config.port, () => {
      console.log(`> Ready on http://${hostname}:${config.port}`);
    });
});
