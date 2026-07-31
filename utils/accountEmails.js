require('dotenv').config();
const nodemailer = require('nodemailer');
const axios = require('axios');
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

function formatIp(ip = '') {
  const value = normalizeIpAddress(ip);
  if (!value) return 'Unavailable';
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
    return normalizedIp ? 'Private or local network' : 'Unavailable';
  }

  try {
    const { data } = await axios.get(`https://ipwho.is/${encodeURIComponent(normalizedIp)}`, {
      timeout: 2500,
    });

    if (!data || data.success !== true) {
      return 'Unavailable';
    }

    const parts = [data.city, data.region, data.country].filter(Boolean);
    const coordinates = data.latitude != null && data.longitude != null
      ? `(${data.latitude}, ${data.longitude})`
      : '';
    const locationText = [parts.join(', '), coordinates].filter(Boolean).join(' ');
    return locationText || 'Unavailable';
  } catch (error) {
    return 'Unavailable';
  }
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

function normalizeLocationValue(value = '') {
  return String(value || '').trim();
}

function formatClientLocation(clientLocation) {
  if (!clientLocation) return '';

  if (typeof clientLocation === 'string') {
    return normalizeLocationValue(clientLocation);
  }

  const parts = [];
  const address = normalizeLocationValue(clientLocation.address);
  const city = normalizeLocationValue(clientLocation.city);
  const region = normalizeLocationValue(clientLocation.region);
  const country = normalizeLocationValue(clientLocation.country);
  const latitude = Number(clientLocation.latitude);
  const longitude = Number(clientLocation.longitude);

  if (address) {
    parts.push(address);
  } else {
    const placeParts = [city, region, country].filter(Boolean);
    if (placeParts.length) parts.push(placeParts.join(', '));
  }

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    parts.push(`(${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
  }

  return parts.join(' ').trim();
}

async function resolveLocationFromCoordinates(latitude, longitude) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return 'Unavailable';
  }

  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      timeout: 4000,
      params: {
        format: 'jsonv2',
        lat,
        lon,
        zoom: 18,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'LavishLadiesSalon/1.0 (+https://lavishladies.com)'
      }
    });

    const address = data?.display_name || '';
    if (address) return address;

    const addressParts = [
      data?.address?.house_number,
      data?.address?.road,
      data?.address?.suburb,
      data?.address?.city || data?.address?.town || data?.address?.village,
      data?.address?.state,
      data?.address?.country
    ].filter(Boolean);

    return addressParts.length ? addressParts.join(', ') : 'Unavailable';
  } catch (error) {
    return 'Unavailable';
  }
}

async function sendLoginNotificationEmail({
  email,
  name,
  method,
  role = 'customer',
  rememberDevice = false,
  userAgent,
  ip,
  clientIp,
  clientLocation
}) {
  if (!email) return;

  const homeUrl = buildAuthUrl('signin', email);
  const displayName = String(name || '').trim() || 'there';
  const resolvedIp = normalizeIpAddress(clientIp || ip);
  const locationFromClient = formatClientLocation(clientLocation);
  const location = locationFromClient || await resolveLocationFromCoordinates(clientLocation?.latitude, clientLocation?.longitude) || await resolveLocationFromIp(resolvedIp);
  const safeDisplayName = escapeHtml(displayName);
  const safeMethod = escapeHtml(method || 'Unavailable');
  const safeDevice = escapeHtml(extractDeviceInfo(userAgent));
  const safeIp = escapeHtml(formatIp(resolvedIp || ip));
  const safeLocation = escapeHtml(location);
  const safeRememberDevice = rememberDevice ? 'Enabled' : 'Not enabled';

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@lavishladies.com',
    to: email,
    subject: 'New Login to Your Lavish Ladies Account',
    html: buildEmailTemplate({
      title: 'Login Successful',
      subtitle: 'This is a confirmation that your account was just accessed.',
      contentHtml: `
        <p style="margin:0 0 18px 0;font-size:16px;line-height:1.7;color:#374151;">Hi <strong>${safeDisplayName}</strong>, your ${escapeHtml(role)} account was signed in successfully. If this was you, no action is required.</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e7eb;padding:0 20px;">
          ${buildDetailRow('Sign-in Method', safeMethod)}
          ${buildDetailRow('Time', formatSignInTime(new Date()))}
          ${buildDetailRow('Device', safeDevice)}
          ${buildDetailRow('IP Address', safeIp)}
          ${buildDetailRow('Location', safeLocation)}
          ${buildDetailRow('Remember Device', safeRememberDevice)}
        </table>
        <div style="margin-top:20px;padding:18px 20px;background:#f9fafb;border:1px solid #e5e7eb;">
          <div style="font-size:14px;line-height:1.7;color:#4b5563;">If you do not recognize this activity, please contact us immediately so we can help secure your account.</div>
        </div>
        <p style="margin:20px 0 0 0;text-align:center;">
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
  extractClientIp,
  formatClientLocation,
  sendLoginNotificationEmail
};
