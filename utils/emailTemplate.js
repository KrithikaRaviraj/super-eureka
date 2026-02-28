function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function getPublicBaseUrl() {
  const envLogoBase = normalizeBaseUrl(process.env.EMAIL_ASSET_BASE_URL);
  if (envLogoBase) {
    return envLogoBase;
  }

  const frontendUrl = normalizeBaseUrl(process.env.FRONTEND_URL);
  if (frontendUrl && !/localhost|127\.0\.0\.1/i.test(frontendUrl)) {
    return frontendUrl;
  }

  return '';
}

function getLogoMarkup() {
  const baseUrl = getPublicBaseUrl();
  if (baseUrl) {
    const logoUrl = `${baseUrl}/lavish-logo.jpeg`;
    return `
      <img
        src="${logoUrl}"
        alt="Lavish Ladies Beauty Salon"
        width="72"
        height="72"
        style="display:inline-block;width:72px;height:72px;object-fit:cover;"
      />
    `;
  }

  return `
    <div style="display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;background:#f3f4f6;color:#111827;font-size:30px;font-weight:700;font-family:serif;">
      L
    </div>
  `;
}

function buildEmailTemplate({ title, subtitle, contentHtml, accent = '#9f1239' }) {
  const frontendUrl = normalizeBaseUrl(process.env.FRONTEND_URL) || 'http://localhost:3000';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1f2937;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
        <tr>
          <td style="padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="margin:0;background:#ffffff;">
              <tr>
                <td style="padding:30px 24px 18px 24px;background:#fafaf9;color:#1f2937;text-align:left;">
                  <div style="margin-bottom:12px;">${getLogoMarkup()}</div>
                  <div style="font-size:12px;letter-spacing:1.1px;color:#6b7280;text-transform:uppercase;">Lavish Ladies Beauty Salon</div>
                  <div style="font-size:24px;font-weight:700;margin-top:6px;color:#111827;">${title}</div>
                  ${subtitle ? `<div style="font-size:14px;color:#4b5563;margin-top:6px;">${subtitle}</div>` : ''}
                </td>
              </tr>
              <tr>
                <td style="padding:24px 24px 12px 24px;">
                  ${contentHtml}
                </td>
              </tr>
              <tr>
                <td style="padding:18px 24px 22px 24px;background:#fafaf9;text-align:center;">
                  <div style="margin-bottom:10px;">
                    <a href="${frontendUrl}/privacy" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 10px;">Privacy Policy</a>
                    <a href="${frontendUrl}/terms" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 10px;">Terms of Service</a>
                    <a href="${frontendUrl}/contact" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 10px;">Contact</a>
                  </div>
                  <p style="margin:6px 0 0 0;font-size:12px;color:#9ca3af;">&copy; 2026 Lavish Ladies Beauty Salon. All rights reserved.</p>
                  <p style="margin:6px 0 0 0;font-size:12px;color:${accent};">Need help? lavishladiessalonuchila@gmail.com</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

module.exports = {
  buildEmailTemplate
};
