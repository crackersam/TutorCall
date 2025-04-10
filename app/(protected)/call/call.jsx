"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import * as mediasoupClient from "mediasoup-client";
import { useSearchParams } from "next/navigation";
import createProducerTransport from "./functions/createProducerTransport.js";
import createProducer from "./functions/createProducer.js";
import requestTransportToConsume from "./functions/requestTransportToConsume.js";

export default function Call({ name }) {
  const searchParams = useSearchParams();
  const roomName = searchParams.get("id");
  const localVideo = useRef();
  const localStream = useRef();
  const runOnce = useRef(false);
  const joinRoomResp = useRef({});
  const device = useRef();
  const producerTransport = useRef(null);
  const videoProducer = useRef(null);
  const audioProducer = useRef(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [consumers, setConsumers] = useState({});
  const consumersRef = useRef({});
  const [activeSpeakers, setActiveSpeakers] = useState();

  const setValue = (arg) => {
    consumersRef.current = arg;
    setConsumers(arg);
    console.log("consumersRef", consumersRef.current);
  };
  useEffect(() => {
    consumersRef.current = consumers;
    console.log("consumersRef", consumersRef.current);
  }, [consumers]);

  useEffect(() => {
    if (runOnce.current) return;

    socket.emit("connected");
    socket.on("connected", async () => {
      console.log("socket connected");
      await gum();
      joinRoomResp.current = await joinRoom();
      await sendFeed();
    });

    socket.on("updateActiveSpeakers", async (newListOfActives) => {
      // This listener should receive consume data and Set up the consumers
      // for the active speakers
      console.log("updateActiveSpeakers payload:", newListOfActives);

      setActiveSpeakers(() => {
        const newState = {};

        newListOfActives.forEach((pid) => {
          const consumerObj = consumersRef.current[pid];
          if (consumerObj) {
            newState[pid] = { ...consumerObj }; // clone to avoid mutation
          }
        });

        console.log("newState (only active speakers):", newState);
        return newState;
      });
    });

    socket.on("newProducersToConsume", (consumeData) => {
      // This Listener should only receive Consume data but not set up a connection
      console.log("newProducersToConsume");
      console.log(consumeData);
      requestTransportToConsume(
        consumeData,
        socket,
        device.current,
        setConsumers
      );
    });
    socket.on("userDisconnected", (pid) => {
      if (consumersRef.current[pid]?.consumerTransport) {
        console.log("removing from active speaker");
        try {
          setActiveSpeakers((prev) => {
            const { [pid]: _, ...rest } = prev;
            return rest;
          });
        } catch (error) {
          console.log("error removing from active speaker", error);
        }

        consumersRef.current[pid].consumerTransport.close();
        console.log("consumerTransport closed");
      }
      const newState = { ...consumersRef.current };
      delete newState[pid];
      console.log("new state", newState);
      setValue(newState);
    });
    console.log("audioproducer", audioProducer.current);
    runOnce.current = true;
  }, []);

  const gum = async () => {
    localStream.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    localVideo.current.srcObject = localStream.current;
    // localVideo.current.muted = true;
  };
  const joinRoom = async () => {
    const res = await socket.emitWithAck("joinRoom", {
      userName: name,
      roomName,
    });
    device.current = new mediasoupClient.Device();
    await device.current.load({
      routerRtpCapabilities: res.routerRtpCapabilities,
    });
    console.log("joinRoomResp", res);
    // console.log("device", device.current);
    requestTransportToConsume(res, socket, device.current, setConsumers);
    return res;
  };
  const sendFeed = async () => {
    producerTransport.current = await createProducerTransport(
      socket,
      device.current
    );
    console.log("Have the producer transport, now we need to produce");
    const producers = await createProducer(
      localStream.current,
      producerTransport.current
    );
    videoProducer.current = producers.videoProducer;
    audioProducer.current = producers.audioProducer;
    console.log("Producers are created!");
  };
  const muteAudio = () => {
    if (audioProducer.current.paused) {
      audioProducer.current.resume();
      socket.emit("audioChange", "unmute");
      setIsAudioMuted(false);
    } else {
      audioProducer.current.pause();
      socket.emit("audioChange", "mute");
      setIsAudioMuted(true);
    }
  };
  return (
    <div>
      {roomName && <h1>Room ID: {roomName}</h1>}
      <button onClick={muteAudio}>{isAudioMuted ? "Unmute" : "Mute"}</button>

      <video
        ref={localVideo}
        autoPlay
        playsInline
        style={{ width: "100px", height: "100px" }}
      />
      <div className="flex gap-2 flex-wrap">
        {Object.keys(activeSpeakers).length > 0 &&
          Object.keys(activeSpeakers).map((key) => {
            return (
              <div key={key} className="">
                <h3>{activeSpeakers[key].userName}</h3>
                <h2>{key}</h2>
                <video
                  id={`remote-video-${key}`}
                  autoPlay
                  playsInline
                  style={{ width: "300px", height: "300px" }}
                  ref={(video) => {
                    if (video) {
                      video.srcObject = activeSpeakers[key].combinedStream;
                    }
                  }}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
