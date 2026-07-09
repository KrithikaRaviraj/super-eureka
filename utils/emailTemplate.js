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
        width="88"
        height="88"
        style="display:block;width:88px;height:88px;object-fit:cover;border-radius:20px;border:1px solid rgba(159,18,57,0.12);"
      />
    `;
  }

  return `
    <div style="display:inline-flex;align-items:center;justify-content:center;width:88px;height:88px;background:linear-gradient(135deg,#fdf2f8 0%,#ffe4e6 100%);color:#9f1239;font-size:34px;font-weight:700;font-family:Georgia,'Times New Roman',serif;border-radius:20px;border:1px solid rgba(159,18,57,0.12);">
      LL
    </div>
  `;
}

function buildEmailTemplate({ title, subtitle, contentHtml, accent = '#9f1239' }) {
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
    <body style="margin:0;padding:0;background:#f6f1ee;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#1f2937;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#fdf7f4 0%,#f6f1ee 100%);">
        <tr>
          <td style="padding:28px 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:680px;margin:0 auto;background:#ffffff;border-radius:28px;overflow:hidden;border:1px solid #f1e4df;box-shadow:0 18px 44px rgba(17,24,39,0.08);">
              <tr>
                <td style="padding:0;background:linear-gradient(135deg,#fff7f3 0%,#fff1f2 50%,#fdf2f8 100%);color:#1f2937;text-align:left;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:32px 32px 24px 32px;">
                        <div style="margin-bottom:18px;">${getLogoMarkup()}</div>
                        <div style="font-size:11px;letter-spacing:2px;color:${accent};text-transform:uppercase;font-weight:700;">Lavish Ladies Beauty Salon</div>
                        <div style="font-size:30px;line-height:1.2;font-weight:700;margin-top:10px;color:#111827;font-family:Georgia,'Times New Roman',serif;">${title}</div>
                        ${subtitle ? `<div style="font-size:15px;line-height:1.6;color:#4b5563;margin-top:10px;max-width:520px;">${subtitle}</div>` : ''}
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
                <td style="padding:24px 32px 30px 32px;background:#fcfaf8;border-top:1px solid #f1e4df;text-align:center;">
                  <div style="font-size:13px;line-height:1.7;color:#6b7280;max-width:520px;margin:0 auto 14px auto;">
                    Thoughtful beauty care, refined service, and a salon experience designed to feel calm from the moment you arrive.
                  </div>
                  <div style="margin-bottom:12px;">
                    <a href="${frontendUrl}/privacy" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 10px;">Privacy Policy</a>
                    <a href="${frontendUrl}/terms" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 10px;">Terms of Service</a>
                    <a href="${frontendUrl}/contact" style="color:#6b7280;text-decoration:none;font-size:12px;margin:0 10px;">Contact</a>
                  </div>
                  <p style="margin:6px 0 0 0;font-size:12px;color:#9ca3af;">&copy; ${currentYear} Lavish Ladies Beauty Salon. All rights reserved.</p>
                  <p style="margin:6px 0 0 0;font-size:12px;color:${accent};font-weight:600;">Need help? lavishladiessalonuchila@gmail.com</p>
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
