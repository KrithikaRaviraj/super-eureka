require('dotenv').config();
const nodemailer = require('nodemailer');
const axios = require('axios');
const { buildEmailTemplate } = require('./emailTemplate');

function createMailTransport() {
  const emailUser = process.env.EMAIL_USER || 'noreply@lavishladies.com';
  const emailPass = process.env.EMAIL_PASS || '';
  const emailHost = String(process.env.EMAIL_HOST || process.env.EMAIL_SMTP_HOST || '').trim();
  const emailPort = Number(process.env.EMAIL_PORT || process.env.EMAIL_SMTP_PORT || 587);
  const emailSecure = String(process.env.EMAIL_SECURE || process.env.EMAIL_SMTP_SECURE || '').toLowerCase() === 'true' || emailPort === 465;

  if (emailHost) {
    return nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailSecure,
      auth: emailPass ? { user: emailUser, pass: emailPass } : undefined,
      connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS || 10000),
      greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT_MS || 10000),
      socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT_MS || 10000),
      tls: {
        rejectUnauthorized: String(process.env.EMAIL_TLS_REJECT_UNAUTHORIZED || 'true').toLowerCase() === 'true'
      }
    });
  }

  const service = String(process.env.EMAIL_SERVICE || 'gmail').trim();
  return nodemailer.createTransport({
    service,
    auth: emailPass ? {
      user: emailUser,
      pass: emailPass
    } : undefined,
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT_MS || 10000),
    socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT_MS || 10000)
  });
}

const transporter = createMailTransport();

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

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeIpAddress(ip = '') {
  let value = String(ip || '').trim();
  if (!value) return '';

  value = value.replace(/^::ffff:/i, '');

  if (value.startsWith('[') && value.endsWith(']')) {
    value = value.slice(1, -1);
  }

  if (value.includes('%')) {
    value = value.split('%')[0];
  }

  return value;
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

function extractBrowserName(userAgent = '') {
  const ua = String(userAgent || '');
  return /Edg\//.test(ua) ? 'Microsoft Edge'
    : /Chrome\//.test(ua) ? 'Google Chrome'
    : /Safari\//.test(ua) && !/Chrome\//.test(ua) ? 'Safari'
    : /Firefox\//.test(ua) ? 'Firefox'
    : /MSIE|Trident\//.test(ua) ? 'Internet Explorer'
    : 'Unknown';
}

function extractOperatingSystem(userAgent = '') {
  const ua = String(userAgent || '');
  return /Windows NT/.test(ua) ? 'Windows'
    : /Android/.test(ua) ? 'Android'
    : /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Macintosh|Mac OS X/.test(ua) ? 'macOS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Unknown';
}

function extractDeviceType(userAgent = '') {
  const ua = String(userAgent || '');
  if (/iPhone|iPad|iPod|Android/.test(ua)) return 'Mobile';
  if (/Windows|Macintosh|Mac OS X|Linux/.test(ua)) return 'Desktop';
  return 'Unknown';
}

function formatIp(ip = '') {
  const value = normalizeIpAddress(ip);
  if (!value) return 'Unavailable';

  if (value === '::1' || value === '127.0.0.1') {
    return '::1';
  }

  return value;
}

function isPrivateOrLocalIp(ip = '') {
  const value = normalizeIpAddress(ip).toLowerCase();
  if (!value) return true;

  if (value === '::1' || value === 'localhost') return true;
  if (value.startsWith('::ffff:127.')) return true;
  if (value.startsWith('127.')) return true;
  if (value.startsWith('10.')) return true;
  if (value.startsWith('192.168.')) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(value)) return true;
  if (value.startsWith('fc') || value.startsWith('fd')) return true;
  if (value.startsWith('fe80:')) return true;

  return false;
}

async function resolveLocationFromIp(ip = '') {
  const normalizedIp = normalizeIpAddress(ip);
  if (!normalizedIp || isPrivateOrLocalIp(normalizedIp)) {
    return normalizedIp ? 'Private or Local Network' : 'Unknown';
  }

  const providers = [
    async () => {
      const { data } = await axios.get(`https://ipwho.is/${encodeURIComponent(normalizedIp)}`, { timeout: 3000 });
      if (!data || data.success !== true) return null;
      return [data.city, data.region, data.country].filter(Boolean).join(', ') || null;
    },
    async () => {
      const { data } = await axios.get(`https://ipapi.co/${encodeURIComponent(normalizedIp)}/json/`, { timeout: 3000 });
      if (!data || data.error === true) return null;
      return [data.city, data.region, data.country_name].filter(Boolean).join(', ') || null;
    },
    async () => {
      const { data } = await axios.get(`https://ip-api.com/json/${encodeURIComponent(normalizedIp)}`, {
        timeout: 3000,
        params: { fields: 'status,city,regionName,country' }
      });
      if (!data || data.status !== 'success') return null;
      return [data.city, data.regionName, data.country].filter(Boolean).join(', ') || null;
    }
  ];

  for (const provider of providers) {
    try {
      const location = await provider();
      if (location) return location;
    } catch (error) {
      // try the next provider
    }
  }

  return 'Unable to determine';
}

function extractClientIp(req = {}) {
  const forwarded = String(req.get?.('x-forwarded-for') || req.headers?.['x-forwarded-for'] || '').trim();
  if (forwarded) {
    const forwardedIps = forwarded.split(',').map((ip) => normalizeIpAddress(ip)).filter(Boolean);
    const publicIp = forwardedIps.find((ip) => !isPrivateOrLocalIp(ip));
    if (publicIp) return publicIp;
    if (forwardedIps[0]) return forwardedIps[0];
  }

  const realIp = normalizeIpAddress(req.get?.('x-real-ip') || req.headers?.['x-real-ip'] || '');
  if (realIp) return realIp;

  return normalizeIpAddress(req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || '127.0.0.1') || '127.0.0.1';
}

function formatTimeZone(timeZone = '') {
  const rawZone = String(timeZone || '').trim();
  if (!rawZone) return 'Asia/Kolkata (IST)';

  if (rawZone === 'Asia/Calcutta' || rawZone === 'Asia/Kolkata') {
    return 'Asia/Kolkata (IST)';
  }

  return `${rawZone} (${new Intl.DateTimeFormat('en-IN', { timeZone: rawZone, timeZoneName: 'short' }).formatToParts(new Date()).find((part) => part.type === 'timeZoneName')?.value || 'UTC'})`;
}

function formatDateTime(date = new Date(), timeZone) {
  const zone = String(timeZone || '').trim() || 'Asia/Kolkata';
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: zone
  }).format(date);
}

async function sendLoginSuccessEmail(user, req = {}) {
  if (!user?.email) return;

  const email = String(user.email).trim().toLowerCase();
  const name = String(user.name || '').trim() || 'there';
  const homeUrl = normalizeBaseUrl(process.env.FRONTEND_URL) || 'http://localhost:3000';
  const loginMethod = String(user.loginMethod || req.body?.loginMethod || 'Unavailable').trim();
  const authProvider = String(user.authProvider || req.body?.authProvider || '').trim();
  const rememberDevice = user.rememberDevice ?? req.body?.rememberDevice ?? false;
  const clientIp = normalizeIpAddress(user.clientIp || req.body?.clientIp || extractClientIp(req));
  const userAgent = req.get?.('user-agent') || req.headers?.['user-agent'] || '';
  const timeZone = String(user.timeZone || req.body?.clientTimezone || '').trim();
  const resolvedLocation = await resolveLocationFromIp(clientIp);
  const displayIp = clientIp === '::1' || clientIp === '127.0.0.1' ? '::1' : (clientIp || 'Unknown');
  const safeDisplayName = escapeHtml(name);
  const safeMethod = escapeHtml(loginMethod || 'Unavailable');
  const safeAuthProvider = escapeHtml(authProvider || 'Not applicable');
  const safeBrowser = escapeHtml(extractBrowserName(userAgent));
  const safeOperatingSystem = escapeHtml(extractOperatingSystem(userAgent));
  const safeDeviceType = escapeHtml(extractDeviceType(userAgent));
  const safeDevice = escapeHtml(`${extractBrowserName(userAgent)} on ${extractOperatingSystem(userAgent)} ${extractDeviceType(userAgent)}`.replace(/\s+/g, ' ').trim());
  const safeIp = escapeHtml(displayIp);
  const safeLocation = escapeHtml(resolvedLocation || 'Unknown');
  const safeRememberDevice = rememberDevice ? 'Enabled' : 'Not enabled';
  const safeDateTime = escapeHtml(formatDateTime(new Date(), timeZone));
  const safeTimeZone = escapeHtml(formatTimeZone(timeZone));

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
    to: email,
    subject: 'New Login to Your Lavish Ladies Account',
    html: buildEmailTemplate({
      title: 'Login Successful',
      subtitle: 'This is a confirmation that your account was just accessed.',
      contentHtml: `
        <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;color:#374151;">Hi <strong>${safeDisplayName}</strong>, your account was signed in successfully. If this was you, no action is required.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 20px;">
          ${buildDetailRow('User Name', safeDisplayName)}
          ${buildDetailRow('Login Method', safeMethod)}
          ${buildDetailRow('Date & Time', safeDateTime)}
          ${buildDetailRow('Time Zone', safeTimeZone)}
          ${buildDetailRow('Browser', safeBrowser)}
          ${buildDetailRow('Operating System', safeOperatingSystem)}
          ${buildDetailRow('Device Type', safeDevice)}
          ${buildDetailRow('IP Address', safeIp)}
          ${buildDetailRow('Location', safeIp === '::1' ? 'Private or Local Network' : safeLocation)}
          ${buildDetailRow('Remember Device', safeRememberDevice)}
          ${authProvider ? buildDetailRow('Authentication Provider', safeAuthProvider) : ''}
        </table>
        <div style="margin-top:20px;padding:18px 20px;background:#f9fafb;border:1px solid #e5e7eb;">
          <div style="font-size:14px;line-height:1.7;color:#4b5563;">If this wasn't you, contact us immediately so we can help secure your account.</div>
        </div>
        <p style="margin:20px 0 0 0;text-align:center;">
          ${buildSecondaryButton(homeUrl, 'Open My Account')}
        </p>
      `
    })
  };

  await transporter.sendMail(mailOptions);
}

module.exports = {
  transporter,
  createMailTransport,
  buildAuthUrl,
  buildPrimaryButton,
  buildSecondaryButton,
  buildDetailRow,
  extractClientIp,
  sendLoginSuccessEmail,
  sendLoginNotificationEmail: sendLoginSuccessEmail
};
