//Make sure everything in here only happens once per user
//Require is undefined for some reason
const nodemailer = require("nodemailer");

// Create a transporter using SMTP
//Using local for now
const transporter = nodemailer.createTransport({
    host: "localhost",
    port: 587,
    secure: false, // use STARTTLS (upgrade connection to TLS after connecting)

    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS,
    // },
});

export { nodemailer, transporter };