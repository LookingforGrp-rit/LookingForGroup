import nodemailer from 'nodemailer';

//MOVE THIS SOMEWHERE WHERE IT ONLY HAPPENS ONCE
// Create a transporter using SMTP
//Using local for now
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 587,
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)

  // auth: {
  //   user: process.env.SMTP_USER,
  //   pass: process.env.SMTP_PASS,
  // },
});

export { transporter };
