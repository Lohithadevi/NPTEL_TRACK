const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
});

const sendOTP = async (to, otp) => {
  await transporter.sendMail({
    from: `"Campus LinkUp" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Your Campus LinkUp OTP',
    html: `
      <div style="font-family:Inter,sans-serif;background:#0f172a;padding:32px;border-radius:8px;max-width:480px;margin:auto">
        <h2 style="color:#fff;margin-bottom:8px">Verify your email</h2>
        <p style="color:#94a3b8;font-size:14px">Enter this OTP to complete your registration. It expires in <strong style="color:#fff">10 minutes</strong>.</p>
        <div style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:24px;text-align:center;margin:24px 0">
          <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#60a5fa">${otp}</span>
        </div>
        <p style="color:#475569;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>
    `
  });
};

const sendMatchNotification = async (to, name, matchName, examName, destination, batch) => {
  await transporter.sendMail({
    from: `"Campus LinkUp" <${process.env.MAIL_USER}>`,
    to,
    subject: `You have a travel match for ${examName}!`,
    html: `
      <div style="font-family:Inter,sans-serif;background:#0f172a;padding:32px;border-radius:8px;max-width:480px;margin:auto">
        <h2 style="color:#fff;margin-bottom:8px">You've been matched!</h2>
        <p style="color:#94a3b8;font-size:14px">Hi <strong style="color:#fff">${name}</strong>, your join request for the trip below has been <strong style="color:#4ade80">accepted</strong>.</p>
        <div style="background:#1e293b;border:1px solid #334155;border-radius:6px;padding:20px;margin:24px 0">
          <p style="color:#60a5fa;font-size:13px;margin:0 0 8px">Travel Partner: <strong style="color:#fff">${matchName}</strong></p>
          <p style="color:#94a3b8;font-size:13px;margin:0 0 4px">Exam: ${examName}</p>
          <p style="color:#94a3b8;font-size:13px;margin:0 0 4px">Destination: ${destination}</p>
          <p style="color:#94a3b8;font-size:13px;margin:0">Batch: ${batch}</p>
        </div>
        <a href="${process.env.APP_URL}/chats" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
          Open Chat
        </a>
        <p style="color:#475569;font-size:12px;margin-top:24px">Campus LinkUp - St. Joseph's College of Engineering, Chennai</p>
      </div>
    `
  });
};

const sendMessageNotification = async (to, recipientName, senderName, messageText, examName) => {
  await transporter.sendMail({
    from: `"Campus LinkUp" <${process.env.MAIL_USER}>`,
    to,
    subject: `New message from ${senderName} on Campus LinkUp`,
    html: `
      <div style="font-family:Inter,sans-serif;background:#0f172a;padding:32px;border-radius:8px;max-width:480px;margin:auto">
        <h2 style="color:#fff;margin-bottom:8px">You have a new message</h2>
        <p style="color:#94a3b8;font-size:14px">Hi <strong style="color:#fff">${recipientName}</strong>, <strong style="color:#60a5fa">${senderName}</strong> sent you a message regarding <strong style="color:#fff">${examName || 'your trip'}</strong>.</p>
        <div style="background:#1e293b;border-left:3px solid #2563eb;border-radius:4px;padding:16px;margin:24px 0">
          <p style="color:#e2e8f0;font-size:14px;margin:0">"${messageText}"</p>
        </div>
        <a href="${process.env.APP_URL}/chats" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600">
          Reply on Campus LinkUp
        </a>
        <p style="color:#475569;font-size:12px;margin-top:24px">Campus LinkUp - St. Joseph's College of Engineering, Chennai</p>
      </div>
    `
  });
};

module.exports = { sendOTP, sendMatchNotification, sendMessageNotification };
