import type { EmailInput } from '@looking-for-group/shared';
import nodemailer from 'nodemailer';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type SendEmailServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;
type SendEmailServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//Make sure this only happens once
//Create a transporter using SMTP
//Using local for now
const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 1025, // mailpit default SMTP port
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
const sendEmail = async (
  email: EmailInput,
): Promise<SendEmailServiceError | SendEmailServiceSuccess> => {
  // const transporter: any = email.transporter;
  // const inviteeName: string = `${email.invitee?.user?.firstName} ${email.invitee?.user?.lastName}`;
  // const inviteeEmail: string = `${email.invitee?.user?.username}.rit.edu`;
  // const targetUserEmail: string = `${email.targetUser.username}.rit.edu`;
  // const projectName: string = `${email.project.title}`;

  try {
    await transporter.verify();
    console.log('Server is ready to take our messages');
  } catch (err) {
    console.error('Verification failed:', err);
    return 'INTERNAL_ERROR';
  }

  try {
    const info = await transporter.sendMail({
      from: `"${email.invitee.firstName} ${email.invitee.lastName}" <${email.invitee.ritEmail}>`, // sender address
      to: `"${email.targetUser.firstName} ${email.targetUser.lastName}" <${email.targetUser.ritEmail}>`, // recipient
      subject: email.subject, // subject line
      text: email.textBody, // plain text body
      html: email.HTMLBody, // HTML body
    });

    console.log('Message sent: %s', info.messageId);
    // Preview URL is only available when using an Ethereal test account
    //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return 'NO_CONTENT';
  } catch (err) {
    console.error('Error while sending mail:', err);
    return 'INTERNAL_ERROR';
  }
};

export { transporter, sendEmail };
