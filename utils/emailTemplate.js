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
      <style>
        * {
          box-sizing: border-box;
        }
        body, table, td, p, a, div {
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table, td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
          border: 0;
          height: auto;
          max-width: 100%;
          outline: none;
          text-decoration: none;
        }
        body {
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
          min-width: 100% !important;
          background: #ffffff !important;
        }
        @media only screen and (max-width: 600px) {
          .email-header-cell {
            padding: 20px 16px 16px 16px !important;
          }
          .email-title {
            font-size: 24px !important;
          }
          .email-subtitle {
            font-size: 14px !important;
          }
          .email-content-cell {
            padding: 20px 16px !important;
          }
          .email-footer-cell {
            padding: 20px 16px !important;
          }
        }
      </style>
    </head>
    <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#111827;width:100%;min-height:100%;">
      <table width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:0;padding:0;background:#ffffff;border-collapse:collapse;">
        <tr>
          <td align="left" style="padding:0;margin:0;background:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" style="width:100%;margin:0;background:#ffffff;border:none;border-collapse:collapse;">
              <tr>
                <td class="email-header-cell" style="padding:24px 20px 20px 20px;background:#ffffff;color:#111827;text-align:left;border-bottom:1px solid #e5e7eb;">
                  <div style="font-size:12px;letter-spacing:1.4px;color:#6b7280;text-transform:uppercase;font-weight:700;">Lavish Ladies Beauty Salon</div>
                  <div class="email-title" style="font-size:28px;line-height:1.25;font-weight:700;margin-top:8px;color:#111827;">${title}</div>
                  ${subtitle ? `<div class="email-subtitle" style="font-size:15px;line-height:1.6;color:#4b5563;margin-top:8px;">${subtitle}</div>` : ''}
                </td>
              </tr>
              <tr>
                <td class="email-content-cell" style="padding:24px 20px;background:#ffffff;">
                  ${contentHtml}
                </td>
              </tr>
              <tr>
                <td class="email-footer-cell" style="padding:20px 20px 24px 20px;background:#fafafa;border-top:1px solid #e5e7eb;text-align:center;">
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
