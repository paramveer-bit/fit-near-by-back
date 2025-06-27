interface GymJoinNotificationProps {
    gymName: string;
    userName: string;
    userPhone: string;
    userEmail: string;
    planName: string;
    startDate: string; // e.g. '2025-07-01'
    endDate: string;   // e.g. '2026-06-30'
}

const GymJoinNotificationTemplate = ({
    gymName,
    userName,
    userPhone,
    userEmail,
    planName,
    startDate,
    endDate
}: GymJoinNotificationProps): string => (
    `<html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>New Member Joined</title>
    </head>
    <body style="
      margin: 0;
      padding: 0;
      background-color: #f2f4f6;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    ">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:20px auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.1);">
        <tr>
          <td style="padding:24px; text-align:center; background-color:#2d7ff9; color:#ffffff;">
            <h1 style="margin:0; font-size:24px;">New Member Alert</h1>
            <p style="margin:4px 0 0;">Hey ${gymName}, you’ve got a new member!</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="padding:8px; font-weight:bold; width:140px;">Name:</td>
                <td style="padding:8px;">${userName}</td>
              </tr>
              <tr>
                <td style="padding:8px; font-weight:bold;">Phone:</td>
                <td style="padding:8px;"><a href="tel:${userPhone}" style="color:#2d7ff9; text-decoration:none;">${userPhone}</a></td>
              </tr>
              <tr>
                <td style="padding:8px; font-weight:bold;">Email:</td>
                <td style="padding:8px;"><a href="mailto:${userEmail}" style="color:#2d7ff9; text-decoration:none;">${userEmail}</a></td>
              </tr>
              <tr>
                <td style="padding:8px; font-weight:bold;">Plan:</td>
                <td style="padding:8px;">${planName}</td>
              </tr>
              <tr>
                <td style="padding:8px; font-weight:bold;">Start Date:</td>
                <td style="padding:8px;">${startDate}</td>
              </tr>
              <tr>
                <td style="padding:8px; font-weight:bold;">End Date:</td>
                <td style="padding:8px;">${endDate}</td>
              </tr>
            </table>
            <p style="margin-top:24px; color:#555555; font-size:14px; line-height:20px;">
              We’re excited to have ${userName} onboard. Please reach out if you need any further information.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px; text-align:center; background-color:#f9f9f9; font-size:12px; color:#888888;">
            This email was sent by <strong>FitNearBy</strong>.
          </td>
        </tr>
      </table>
    </body>
  </html>`
);

export default GymJoinNotificationTemplate;
