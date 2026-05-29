import nodemailer from 'nodemailer';

//Make sure this only happens once
//Create a transporter using SMTP
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

/**
  * Async function that sends the email properly
  * The kind property has not been fully implemented yet
  * @param EmailInvite email object to read info from and send
  */
//Change any to email once imports/exports are figured out
const sendEmail = async (email: any) => {
  const transporter: any = email.transporter;
  const inviteeName: string = `${email.invitee?.user?.firstName} ${email.invitee?.user?.lastName}`;
  const inviteeEmail: string = `${email.invitee?.user?.username}.rit.edu`;
  const targetUserEmail: string = `${email.targetUser.username}.rit.edu`;
  const projectName: string = `${email.project.title}`;

  try {
    await transporter.verify();
    console.log("Server is ready to take our messages");
  } catch (err) {
    console.error("Verification failed:", err);
  }

  try {
    const info = await transporter.sendMail({
      from: `"${inviteeName}" <${inviteeEmail}>`, // sender address
      to: `<ddw6891@rit.edu>`, // list of recipients
      subject: `Invitation to join ${projectName}`, // subject line
      text: `${email.textBody}`, // plain text body
      html: `${email.HTMLBody}`, // HTML body
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is only available when using an Ethereal test account
    //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}

export { transporter, sendEmail };
