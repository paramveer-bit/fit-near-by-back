interface GymJoinNotificationProps {
  gymName: string;
  gymEmail: string;
  gymLocation: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  razorpayOrderId: string | null; // Razorpay order ID, can be null if not applicable
  planName: string;
  planPrice: string;   // e.g. '$499'
  startDate: string;   // e.g. '2025-07-01'
  endDate: string;     // e.g. '2026-06-30'
}

const GymJoinNotificationTemplate = ({
  gymName,
  gymEmail,
  gymLocation,
  userId,
  userName,
  userPhone,
  userEmail,
  razorpayOrderId,
  planName,
  planPrice,
  startDate,
  endDate
}: GymJoinNotificationProps): string => (
  `<html>
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>New Member Joined – FitNearBy</title>
    </head>
    <body style="
      margin:0;
      padding:0;
      background-color:#eef2f7;
      font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    ">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:24px auto; background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background-color:#1e73be; padding:20px; text-align:center;">
            <h1 style="margin:0; color:#ffffff; font-size:22px;">FitNearBy Notification</h1>
          </td>
        </tr>

        <!-- Gym Info -->
        <tr>
          <td style="padding:16px;">
            <h2 style="margin:0 0 12px; color:#333333; font-size:18px;">Hello ${gymName},</h2>
            <p style="margin:0 0 8px; color:#555555; font-size:14px;">
              You have a brand new member joining through FitNearBy!
            </p>
            <table width="100%" cellpadding="4" cellspacing="0" style="border-collapse:collapse; margin-top:12px;">
              <tr>
                <td style="font-weight:bold; color:#333333; width:120px;">Gym Email:</td>
                <td style="color:#555555;"><a href="mailto:${gymEmail}" style="color:#1e73be; text-decoration:none;">${gymEmail}</a></td>
              </tr>
              <tr>
                <td style="font-weight:bold; color:#333333;">Location:</td>
                <td style="color:#555555;">${gymLocation}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Member Details -->
        <tr>
          <td style="padding:16px; background-color:#f7f9fc;">
            <h3 style="margin:0 0 12px; color:#333333; font-size:16px;">Member Details</h3>
            <table width="100%" cellpadding="4" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="font-weight:bold; color:#333333; width:140px;">User ID:</td>
                <td style="color:#555555;">${userId}</td>
              </tr>
              <tr>
                <td style="font-weight:bold; color:#333333;">Name:</td>
                <td style="color:#555555;">${userName}</td>
              </tr>
              <tr>
                <td style="font-weight:bold; color:#333333;">Phone:</td>
                <td style="color:#555555;"><a href="tel:${userPhone}" style="color:#1e73be; text-decoration:none;">${userPhone}</a></td>
              </tr>
              <tr>
                <td style="font-weight:bold; color:#333333;">Email:</td>
                <td style="color:#555555;"><a href="mailto:${userEmail}" style="color:#1e73be; text-decoration:none;">${userEmail}</a></td>
              </tr>
              <tr>
                <td style="font-weight:bold; color:#333333;">Razorpay Order ID:</td>
                <td style="color:#555555;">${razorpayOrderId}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Plan Details -->
        <tr>
          <td style="padding:16px;">
            <h3 style="margin:0 0 12px; color:#333333; font-size:16px;">Plan Details</h3>
            <table width="100%" cellpadding="4" cellspacing="0" style="border-collapse:collapse;">
              <tr>
                <td style="font-weight:bold; color:#333333; width:120px;">Plan Name:</td>
                <td style="color:#555555;">${planName}</td>
              </tr>
              <tr>
                <td style="font-weight:bold; color:#333333;">Price:</td>
                <td style="color:#555555;">${planPrice}</td>
              </tr>
              <tr>
                <td style="font-weight:bold; color:#333333;">Start Date:</td>
                <td style="color:#555555;">${startDate}</td>
              </tr>
              <tr>
                <td style="font-weight:bold; color:#333333;">End Date:</td>
                <td style="color:#555555;">${endDate}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px; text-align:center; background-color:#f1f3f6; font-size:12px; color:#777777;">
            This email was sent by <strong>FitNearBy</strong>. Thank you for partnering with us!
          </td>
        </tr>
      </table>
    </body>
  </html>`
);

export default GymJoinNotificationTemplate;
