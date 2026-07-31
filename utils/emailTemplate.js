function normalizeBaseUrl(url) {
  return String(url || '').trim().replace(/\/+$/, '');
}

function buildEmailTemplate({ title, subtitle, contentHtml, accent = '#111827' }) {
  const frontendUrl = normalizeBaseUrl(process.env.FRONTEND_URL) || 'http://localhost:3000';
  const currentYear = new Date().getFullYear();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#111827;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;">
        <tr>
          <td style="padding:24px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;">
              <tr>
                <td style="padding:0;background:#ffffff;color:#111827;text-align:left;border-bottom:1px solid #e5e7eb;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:28px 32px 24px 32px;">
                        <div style="font-size:12px;letter-spacing:1.4px;color:#6b7280;text-transform:uppercase;font-weight:700;">Lavish Ladies Beauty Salon</div>
                        <div style="font-size:28px;line-height:1.25;font-weight:700;margin-top:8px;color:#111827;">${title}</div>
                        ${subtitle ? `<div style="font-size:15px;line-height:1.6;color:#4b5563;margin-top:8px;max-width:520px;">${subtitle}</div>` : ''}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:32px;">
                  ${contentHtml}
                </td>
              </tr>
              <tr>
                <td style="padding:20px 32px 24px 32px;background:#fafafa;border-top:1px solid #e5e7eb;text-align:center;">
                  <div style="margin-bottom:12px;">
                    <a href="${frontendUrl}/privacy" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 10px;">Privacy Policy</a>
                    <a href="${frontendUrl}/terms" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 10px;">Terms</a>
                    <a href="${frontendUrl}/contact" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 10px;">Contact</a>
                  </div>
                  <p style="margin:6px 0 0 0;font-size:12px;color:#9ca3af;">&copy; ${currentYear} Lavish Ladies Beauty Salon. All rights reserved.</p>
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
