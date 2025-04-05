"use client";

import { useEffect, useRef, useState } from "react";
import { socketForTwo } from "@/lib/socket";
import * as mediasoupClient from "mediasoup-client";

export default function Home() {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const device = useRef(null);
  const rtpCapabilities = useRef(null);
  const producerTransport = useRef(null);
  const producer = useRef(null);
  const consumerTransport = useRef(null);
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
    socketForTwo.on("connection-success", ({ socketId, existsProducer }) => {
      console.log("socketId", socketId, "existsProducer", existsProducer);
    });
  }, [socketForTwo]);
  const streamSuccess = (stream) => {
    localVideo.current.srcObject = stream;
    const track = stream.getTracks()[1];
    params.current = {
      ...params.current,
      track,
    };
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
  const goConnect = async (producerOrConsumer) => {
    isProducer.current = producerOrConsumer;
    await getRtpCapabilities();
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
      await goCreateTransport();
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

  const createSendTransport = async () => {
    socketForTwo.emit(
      "createWebRtcTransport",
      { sender: true },
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
                ({ id }) => {
                  callback({ id });
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

  const createRecvTransport = async () => {
    await socketForTwo.emit(
      "createWebRtcTransport",
      { sender: false },
      ({ params }) => {
        if (params.error) {
          console.error(params.error);
          return;
        }
        console.log(params);
        consumerTransport.current = device.current.createRecvTransport(params);
        consumerTransport.current.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              await socketForTwo.emit("transport-recv-connect", {
                // transportId: consumerTransport.current.id,
                dtlsParameters,
              });
              callback();
            } catch (error) {
              console.error("transport connect error:", error);
              errback(error);
            }
          }
        );
      }
    );
  };
  const connectRecvTransport = async () => {
    await socketForTwo.emit(
      "consume",
      { rtpCapabilities: device.current.rtpCapabilities },
      async ({ params }) => {
        if (params.error) {
          console.error("consume error:", params.error);
          return;
        }
        console.log("consume params", params);
        consumer.current = await consumerTransport.current.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });
        const { track } = consumer.current;
        remoteVideo.current.srcObject = new MediaStream([track]);

        socketForTwo.emit("consumer-resume", {});
      }
    );
  };

  return (
    <div>
      <button onClick={() => getLocalStream()}>Publish</button>
      <button onClick={() => createRecvTransport()}>Consume</button>

      <video
        id="localVideo"
        ref={localVideo}
        autoPlay
        playsInline
        muted
        style={{ width: "100%", height: "100%" }}
      ></video>
      <video
        id="remoteVideo"
        ref={remoteVideo}
        autoPlay
        playsInline
        style={{ width: "100%", height: "100%" }}
      ></video>
    </div>
  );
}
