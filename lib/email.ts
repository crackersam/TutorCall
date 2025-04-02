import nodemailer from "nodemailer";

interface MailData {
  from: string;
  replyTo: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (
  email: string,
  from: string,
  subject: string,
  text: string,
  html: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 587,
    auth: {
      user: "resend",
      pass: process.env.RESEND_API_KEY,
    },
  });

  await new Promise<void>((resolve, reject) => {
    // verify connection configuration
    transporter.verify(function (error) {
      if (error) {
        console.log(error.message);
        reject(error);
      } else {
        console.log("Server is ready to take our messages");
        resolve();
      }
    });
  });

  const mailData: MailData = {
    from: from,
    replyTo: from,
    to: email,
    subject: subject,
    text: text,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailData);
    console.log(info);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
};
