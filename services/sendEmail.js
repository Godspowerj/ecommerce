import transporter from "../utilis/email.js";

export const sendEmail = async ({ to, subject, text, html, from }) => {
  try {
    const mailOptions = {
      from: from || `"Your App Name" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};
