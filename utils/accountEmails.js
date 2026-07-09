require('dotenv').config();
const nodemailer = require('nodemailer');
const { buildEmailTemplate } = require('./emailTemplate');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'noreply@lavishladies.com',
    pass: process.env.EMAIL_PASS || ''
  }
});

function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function buildAuthUrl(mode, email) {
  const baseUrl = normalizeBaseUrl(process.env.FRONTEND_URL) || 'http://localhost:3000';
  const params = new URLSearchParams({ auth: 'signin', mode });
  if (email) params.set('email', String(email).trim().toLowerCase());
  return `${baseUrl}/?${params.toString()}`;
}

function buildPrimaryButton(href, label, background = '#111827') {
  return `
    <a href="${href}" style="display:inline-block;background:${background};color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.2px;">${label}</a>
  `;
}

function buildSecondaryButton(href, label) {
  return `
    <a href="${href}" style="display:inline-block;background:#ffffff;color:#111827;padding:12px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:0.2px;border:1px solid #d1d5db;">${label}</a>
  `;
}

function buildDetailRow(label, value) {
  return `
    <tr>
      <td style="padding:13px 0;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:700;letter-spacing:0.4px;color:#6b7280;text-transform:uppercase;width:170px;vertical-align:top;">${label}</td>
      <td style="padding:13px 0;border-bottom:1px solid #e5e7eb;font-size:15px;line-height:1.6;color:#374151;">${value}</td>
    </tr>
  `;
}

function formatSignInTime(date = new Date()) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata'
  }).format(date);
}

function extractDeviceInfo(userAgent = '') {
  const ua = String(userAgent || '');
  const browser =
    /Edg\//.test(ua) ? 'Microsoft Edge' :
    /Chrome\//.test(ua) ? 'Google Chrome' :
    /Safari\//.test(ua) && !/Chrome\//.test(ua) ? 'Safari' :
    /Firefox\//.test(ua) ? 'Firefox' :
    /MSIE|Trident\//.test(ua) ? 'Internet Explorer' :
    'Unknown browser';

  const device =
    /Android/.test(ua) ? 'Android device' :
    /iPhone|iPad|iPod/.test(ua) ? 'iPhone or iPad' :
    /Windows/.test(ua) ? 'Windows device' :
    /Macintosh|Mac OS X/.test(ua) ? 'Mac device' :
    /Linux/.test(ua) ? 'Linux device' :
    'Unknown device';

  return `${browser} on ${device}`;
}

function maskIp(ip = '') {
  const value = String(ip || '').trim();
  if (!value) return 'Unavailable';
  if (value.includes(':')) {
    const parts = value.split(':').filter(Boolean);
    return `${parts.slice(0, 3).join(':')}:*:*`;
  }
  const parts = value.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.x.x`;
  }
  return 'Unavailable';
}

async function sendLoginNotificationEmail({
  email,
  name,
  method,
  role = 'customer',
  rememberDevice = false,
  userAgent,
  ip
}) {
  if (!email) return;

  const resetUrl = buildAuthUrl('reset', email);
  const homeUrl = buildAuthUrl('signin', email);
  const displayName = String(name || '').trim() || 'there';

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
    to: email,
    subject: 'New Login to Your Lavish Ladies Account',
    html: buildEmailTemplate({
      title: 'Login Successful',
      subtitle: 'This is a confirmation that your account was just accessed.',
      contentHtml: `
        <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;color:#374151;">Hi <strong>${displayName}</strong>, your ${role} account was signed in successfully. If this was you, no action is required.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 20px;">
          ${buildDetailRow('Sign-in Method', method)}
          ${buildDetailRow('Time', formatSignInTime(new Date()))}
          ${buildDetailRow('Device', extractDeviceInfo(userAgent))}
          ${buildDetailRow('IP Address', maskIp(ip))}
          ${buildDetailRow('Remember Device', rememberDevice ? 'Enabled' : 'Not enabled')}
        </table>
        <div style="margin-top:20px;padding:18px 20px;background:#f9fafb;border:1px solid #e5e7eb;">
          <div style="font-size:14px;line-height:1.7;color:#4b5563;">If you do not recognize this activity, reset your password immediately and contact us so we can help secure your account.</div>
        </div>
        <p style="margin:20px 0 0 0;text-align:center;">
          ${buildPrimaryButton(resetUrl, 'Reset Password')}
          <span style="display:inline-block;width:10px;"></span>
          ${buildSecondaryButton(homeUrl, 'Open Account')}
        </p>
      `
    })
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  transporter,
  buildAuthUrl,
  buildPrimaryButton,
  buildSecondaryButton,
  buildDetailRow,
  sendLoginNotificationEmail
};
