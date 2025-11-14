import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "f3a34f7a6fdcb0", // or process.env.MAILTRAP_USER
    pass: "86b2b3387dbb6f", // or process.env.MAILTRAP_PASS
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Error configuring email transporter:", error);
  } else {
    console.log("✅ Email transporter is ready to send messages");
  }
});

export default transporter;
