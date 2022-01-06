import nodemailer from "nodemailer";

class mailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "test@gmail.com",
        pass: "test",
      },
    });
  }
  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
      from: "test@gmail.com",
      to,
      subject: "Активация аккаунта на " + process.env.API_URL,
      text: "",
      html: `
      <div>
      <h1>Для активациии перейдите по ссылке </h1>
      <a href="${link}">${link}</a>
</div>`,
    });
  }
}

export default new mailService();
