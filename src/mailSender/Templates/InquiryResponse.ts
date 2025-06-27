interface ConfirmationEmailProps {
  name: string;
  email: string;
  inquiry: string;
  subject: string;
  message: string;
}

const ConfirmationEmailTemplate = ({
  name,
  email,
  inquiry,
  subject,
  message
}: ConfirmationEmailProps): string => (
  `<html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>We’ve Received Your Inquiry</title>
    </head>
    <body style="
      background-color: #f9f9f9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
    ">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:20px auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <tr>
          <td style="padding: 24px; text-align: center; background-color: #2d7ff9; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px;">Thanks for Reaching Out!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 24px;">
            <p style="margin: 0 0 16px; color: #333333; font-size: 16px; line-height: 24px;">
              Hi ${name},
            </p>
            <p style="margin: 0 0 16px; color: #555555; font-size: 14px; line-height: 20px;">
              We’ve received your inquiry and one of our team members will get back to you shortly. Here’s a summary of what you submitted:
            </p>
            <table width="100%" cellpadding="6" cellspacing="0" style="border-collapse:collapse; margin-bottom: 24px;">
              <tr>
                <td style="font-weight:bold; color:#333333; width:130px;">Inquiry Type:</td>
                <td style="color:#555555;">${inquiry}</td>
              </tr>
              <tr>
                <td style="font-weight:bold; color:#333333;">Subject:</td>
                <td style="color:#555555;">${subject}</td>
              </tr>
            </table>
            <div style="
              background-color: #f1f1f1;
              padding: 16px;
              border-radius: 4px;
            ">
              <p style="margin:0; color:#333333; font-size:14px; line-height:20px;">
                ${message.replace(/\n/g, '<br/>')}
              </p>
            </div>
            <p style="margin: 24px 0 0; color: #555555; font-size: 14px; line-height: 20px;">
              If you need to add anything or have more questions, just reply to this email.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding: 16px; text-align: center; background-color: #f9f9f9; font-size: 12px; color: #777777;">
            This confirmation was sent by <strong>FitNearBy</strong>. We appreciate you getting in touch!
          </td>
        </tr>
      </table>
    </body>
  </html>`
);

export default ConfirmationEmailTemplate;
