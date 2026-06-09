import type { EmailInput } from '@looking-for-group/shared';
import nodemailer from 'nodemailer';
import envConfig from '#config/env.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type SendEmailServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;
type SendEmailServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

// For development testing, this uses mailpit as the SMTP
// install from https://mailpit.axllent.org
// run `mailpit` in terminal to start mailpit
// open http://localhost:8025 in browser to see webUI

//Make sure this only happens once
//Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: envConfig.env === 'development' ? 'localhost' : 'smtp.resend.com',
  port: envConfig.env === 'development' ? 1025 : 587, // 1025 is mailpit default SMTP port
  secure: false, // use STARTTLS (upgrade connection to TLS after connecting)
  auth:
    envConfig.env === 'development'
      ? {}
      : {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
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
  try {
    await transporter.verify();
    console.log('Server is ready to take our messages');
  } catch (err) {
    console.error('Verification failed:', err);
    return 'INTERNAL_ERROR';
  }

  try {
    const info = await transporter.sendMail({
      from:
        envConfig.env === 'development'
          ? `"${email.inviter.firstName} ${email.inviter.lastName}" <${email.inviter.ritEmail}>`
          : `"Looking For Group" <lfg@lfg.gccis.rit.edu>`,
      replyTo: `"${email.inviter.firstName} ${email.inviter.lastName}" <${email.inviter.ritEmail}>`, // inviter
      to: `"${email.invitee.firstName} ${email.invitee.lastName}" <${email.invitee.ritEmail}>`, // invitee
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
