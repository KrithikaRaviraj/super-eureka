const fs = require('fs');
const path = require('path');

let cachedLogoDataUri = null;

function getLogoDataUri() {
  if (cachedLogoDataUri) {
    return cachedLogoDataUri;
  }

  try {
    const logoPath = path.join(__dirname, '..', 'src', 'assets', 'lavish-logo.jpeg');
    const imageBuffer = fs.readFileSync(logoPath);
    cachedLogoDataUri = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
    return cachedLogoDataUri;
  } catch (error) {
    return null;
  }
}

function getEmailLogoHtml(size = 64, marginBottom = 16) {
  const logoDataUri = getLogoDataUri();

  if (!logoDataUri) {
    return '';
  }

  return `
    <div style="margin-bottom: ${marginBottom}px;">
      <img
        src="${logoDataUri}"
        alt="Lavish Ladies Beauty Salon"
        width="${size}"
        height="${size}"
        style="display: inline-block; width: ${size}px; height: ${size}px; border-radius: 50%; object-fit: cover; background: #ffffff; padding: 6px; border: 1px solid #e5e7eb; box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);"
      />
    </div>
  `;
}

module.exports = {
  getEmailLogoHtml
};
