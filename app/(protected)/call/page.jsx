"use client";

import { useEffect, useRef, useState } from "react";
import { socketForTwo } from "@/lib/socket";
import * as mediasoupClient from "mediasoup-client";
import { useSearchParams } from "next/navigation";
import Consumer from "./consumer";

export default function Home() {
  const searchParams = useSearchParams();
  const roomName = searchParams.get("id");
  const runOnce = useRef(false);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const device = useRef(null);
  const rtpCapabilities = useRef(null);
  const producerTransport = useRef(null);
  const producer = useRef(null);
  const [consumerTransports, setConsumerTransports] = useState([]);
  const consumer = useRef(null);
  const isProducer = useRef(false);
  const params = useRef({
    // mediasoup params
    encodings: [
      {
        rid: "r0",
        maxBitrate: 100000,
        scalabilityMode: "S3T3",
      },
      {
        rid: "r1",
        maxBitrate: 300000,
        scalabilityMode: "S3T3",
      },
      {
        rid: "r2",
        maxBitrate: 900000,
        scalabilityMode: "S3T3",
      },
    ],
    // https://mediasoup.org/documentation/v3/mediasoup-client/api/#ProducerCodecOptions
    codecOptions: {
      videoGoogleStartBitrate: 1000,
    },
  });

  useEffect(() => {
    if (runOnce.current) return;
    runOnce.current = true;
    socketForTwo.emit("ready");
    socketForTwo.on("connection-success", ({ socketId, existsProducer }) => {
      console.log("socketId", socketId, "existsProducer", existsProducer);
      getLocalStream();
    });
    socketForTwo.on("new-producer", ({ producerId }) =>
      signalNewConsumerTransport(producerId)
    );
    socketForTwo.on("producer-close", ({ remoteProducerId }) => {
      const producerToClose = consumerTransports.current.find(
        (transportData) => transportData.producerId === remoteProducerId
      );
      producerToClose.consumerTransport.close();
      producerToClose.consumer.close();
      consumerTransports.current = consumerTransports.current.filter(
        (transportData) => transportData.producerId !== remoteProducerId
      );
    });
  }, []);

  useEffect(() => {
    console.log(consumerTransports.length);
  }, [consumerTransports.length]);

  const streamSuccess = (stream) => {
    localVideo.current.srcObject = stream;
    const track = stream.getTracks()[1];
    params.current = {
      ...params.current,
      track,
    };
    joinRoom();
  };
  const joinRoom = () => {
    socketForTwo.emit("join-room", { roomName }, (data) => {
      console.log("rouuter rtpCapabilities", data.rtpCapabilities);
      rtpCapabilities.current = data.rtpCapabilities;
      createDevice();
    });
  };

  const getLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamSuccess(stream);
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };
  const goConsume = async () => {
    goConnect(false);
  };
  const goConnect = async (producerOrConsumer) => {
    isProducer.current = producerOrConsumer;
    device.current === null ? await getRtpCapabilities() : goCreateTransport();
  };
  const goCreateTransport = async () => {
    isProducer.current
      ? await createSendTransport()
      : await createRecvTransport();
  };
  const createDevice = async () => {
    try {
      device.current = new mediasoupClient.Device();
      await device.current.load({
        routerRtpCapabilities: rtpCapabilities.current,
      });
      console.log("routerRtpCapabilities", device.current.rtpCapabilities);
      await createSendTransport();
    } catch (error) {
      console.error("Error creating device.", error);
    }
  };
  const getRtpCapabilities = async () => {
    socketForTwo.emit("create-room", async (data) => {
      console.log("rtpCapabilities", data.rtpCapabilities);
      rtpCapabilities.current = data.rtpCapabilities;
      await createDevice();
    });
  };

  const getProducers = async () => {
    socketForTwo.emit("get-producers", async (producerIds) => {
      producerIds.forEach(signalNewConsumerTransport);
    });
  };

  const createSendTransport = async () => {
    socketForTwo.emit(
      "createWebRtcTransport",
      { consumer: false },
      ({ params }) => {
        if (params.error) {
          console.error(params.error);
          return;
        }
        console.log("createWebRtcTransport params", params);
        producerTransport.current = device.current.createSendTransport(params);
        producerTransport.current.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              await socketForTwo.emit("transport-connect", {
                // transportId: producerTransport.current.id,
                dtlsParameters,
              });
              callback();
            } catch (error) {
              console.error("transport connect error:", error);
              errback(error);
            }
          }
        );
        producerTransport.current.on(
          "produce",
          async (parameters, callback, errback) => {
            console.log(parameters);
            try {
              socketForTwo.emit(
                "transport-produce",
                {
                  // transportId: producerTransport.current.id,
                  kind: parameters.kind,
                  rtpParameters: parameters.rtpParameters,
                  appData: parameters.appData,
                },
                ({ id, producersExist }) => {
                  callback({ id });
                  if (producersExist) getProducers();
                }
              );
            } catch (error) {
              console.error("transport produce error:", error);
              errback(error);
            }
            callback({ id: parameters.id });
          }
        );
        connectSendTransport();
      }
    );
  };
  const connectSendTransport = async () => {
    producer.current = await producerTransport.current.produce(params.current);
    producer.current.on("trackended", () => {
      console.log("track ended");
    });
    producer.current.on("transportclose", () => {
      console.log("transport closed");
    });
  };

  const signalNewConsumerTransport = async (remoteProducerId) => {
    await socketForTwo.emit(
      "createWebRtcTransport",
      { consumer: true },
      ({ params }) => {
        if (params.error) {
          console.error(params.error);
          return;
        }
        console.log(params);
        const consumerTransport = device.current.createRecvTransport(params);
        consumerTransport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              await socketForTwo.emit("transport-recv-connect", {
                // transportId: consumerTransport.current.id,
                dtlsParameters,
                serverConsumerTransportId: params.id,
              });
              callback();
            } catch (error) {
              console.error("transport connect error:", error);
              errback(error);
            }
          }
        );
        connectRecvTransport(consumerTransport, remoteProducerId, params.id);
      }
    );
  };
  const connectRecvTransport = async (
    consumerTransport,
    remoteProducerId,
    serverConsumerTransportId
  ) => {
    await socketForTwo.emit(
      "consume",
      {
        rtpCapabilities: device.current.rtpCapabilities,
        remoteProducerId,
        serverConsumerTransportId,
      },
      async ({ params }) => {
        if (params.error) {
          console.error("consume error:", params.error);
          return;
        }
        console.log("consume params", params);
        const consumer = await consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });
        console.log("kind ", params.kind);
        setConsumerTransports((prevConsumerTransports) => [
          ...prevConsumerTransports,
          {
            consumerTransport,
            serverConsumerTransportId: params.id,
            producerId: remoteProducerId,
            consumer,
            serverConsumerId: params.serverConsumerId,
          },
        ]);
      }
    );
  };

  return (
    <div>
      {roomName && <h1>Room ID: {roomName}</h1>}
      <video
        ref={localVideo}
        autoPlay
        playsInline
        style={{ width: "300px", height: "300px" }}
      />

      {consumerTransports.map((consumerTransport) => {
        return (
          <div key={consumerTransport.serverConsumerTransportId}>
            <Consumer
              key={consumerTransport.serverConsumerTransportId}
              consumerTransport={consumerTransport}
            />
          </div>
        );
      })}
    </div>
  );
}
