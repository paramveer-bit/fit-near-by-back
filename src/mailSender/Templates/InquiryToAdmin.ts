interface OwnerNotificationProps {
    name: string;
    email: string;
    inquiry: string;
    subject: string;
    message: string;
}

const OwnerNotificationTemplate = ({
    name,
    email,
    inquiry,
    subject,
    message
}: OwnerNotificationProps): string => (
    `<html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Enquiry Received</title>
    </head>
    <body style="
      margin: 0; 
      padding: 0; 
      background: #f4f4f7; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    ">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <tr>
          <td style="padding: 24px;">
            <h2 style="margin: 0 0 16px; color: #333333; font-size: 22px; text-align: center;">
              🔔 New Enquiry Alert
            </h2>
            <p style="margin: 0 0 12px; color: #555555; font-size: 14px;">
              You have received a new enquiry via your website contact form. Details below:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333333; width: 120px;">Name:</td>
                <td style="padding: 8px 0; color: #555555;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333333;">Email:</td>
                <td style="padding: 8px 0; color: #555555;"><a href="mailto:${email}" style="color: #2d7ff9; text-decoration: none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333333;">Inquiry Type:</td>
                <td style="padding: 8px 0; color: #555555;">${inquiry}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #333333;">Subject:</td>
                <td style="padding: 8px 0; color: #555555;">${subject}</td>
              </tr>
            </table>
            <div style="
              margin-top: 20px;
              background: #f9f9f9;
              border-radius: 4px;
              padding: 16px;
            ">
              <p style="margin: 0 0 8px; font-weight: bold; color: #333333;">Message:</p>
              <p style="margin: 0; color: #555555; font-size: 14px; line-height: 20px;">${message.replace(/\n/g, '<br/>')}</p>
            </div>
            <p style="margin-top: 24px; font-size: 12px; color: #888888; text-align: center;">
              This is an automated notification from your website.
            </p>
          </td>
        </tr>
      </table>
    </body>
  </html>`
);

export default OwnerNotificationTemplate;
