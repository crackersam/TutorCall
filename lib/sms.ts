import https from "https";
import { IncomingMessage } from "http";
const username = process.env.BULKSMS_USERNAME;
const password = process.env.BULKSMS_PASSWORD;

export const sendSMS = (to: string, from: string, body: string) => {
  const postData = JSON.stringify({
    to: [to],
    from: from,
    body: body,
  });

  const options = {
    hostname: "api.bulksms.com",
    port: 443,
    path: "/v1/messages",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": postData.length,
      Authorization:
        "Basic " + Buffer.from(username + ":" + password).toString("base64"),
    },
  };
  const req = https.request(options, (resp: IncomingMessage) => {
    console.log("statusCode:", resp.statusCode);
    let data = "";
    resp.on("data", (chunk) => {
      data += chunk;
    });
    resp.on("end", () => {
      console.log("Response:", data);
    });
  });

  req.on("error", (e: Error) => {
    console.error(e);
  });

  req.write(postData);
  req.end();
};
