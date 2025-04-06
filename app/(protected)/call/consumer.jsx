import React, { useEffect } from "react";
import { socketForTwo } from "@/lib/socket";

const Consumer = ({ consumerTransport }) => {
  console.log("consumerTransport", consumerTransport.consumer);
  const videoRef = React.useRef();
  useEffect(() => {
    const { track } = consumerTransport.consumer;
    const stream = new MediaStream([track]);
    videoRef.current.srcObject = stream;
    socketForTwo.emit("consumer-resume", {
      serverConsumerId: consumerTransport.serverConsumerId,
    });
  }, []);

  return <video ref={videoRef} autoPlay controls playsInline />;
};

export default Consumer;
