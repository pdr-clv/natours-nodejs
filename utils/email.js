// we will use package nodemailer to send and email to user.
const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.from = `Pedro Calvo <${process.env.EMAIL_FROM}>`;
    this.url = url;
  }

  newTransport() {
    //if we are in production Sendgrid, or if we are in development, mailtrap
    if (process.env.NODE_ENV === 'production') {
      // Sendgrid
      return 1;
    }
    // 1) Create a transporter. It can be gmail Service or any mail service.
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      //activate in gmail "less secure app" option
    });
  }

  async send(template, subject) {
    // 1. Render HTML based on a pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    // 2. Define email Options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      //text: htmlToText.fromString(html),
      text: htmlToText(html),
    };
    // 3. Create transport and send email.
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Natours || Your passport reset token');
  }
};
