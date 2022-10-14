import { SENDER_EMAIL, SENDGRID_API_KEY } from "./config";
import sgMail from "@sendgrid/mail";

sgMail.setApiKey(SENDGRID_API_KEY);

export async function sendCustomerVerificationEmail(to: string, code: string) {
  const msg = {
    to: to,
    from: SENDER_EMAIL,
    subject: "Cloths Store",
    text: "Customer Email Verification",
    html: `
            <div>
                Hello. this is a text from SendGrid.
                Your verification code is <br>
                <strong>${code}</strong>
            </div>
        `,
  };

  await sgMail.send(msg);
}
