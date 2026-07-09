const crypto = require('crypto');

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;
const PASSWORD_RULES = [
  `Be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters long`,
  'Include at least one uppercase letter',
  'Include at least one lowercase letter',
  'Include at least one number',
  'Include at least one special character',
  'Do not include spaces'
];

function validatePassword(password, email = '') {
  const normalized = String(password || '');
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const localPart = normalizedEmail.split('@')[0];

  if (normalized.length < PASSWORD_MIN_LENGTH || normalized.length > PASSWORD_MAX_LENGTH) {
    return { valid: false, message: `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters long.` };
  }
  if (/\s/.test(normalized)) {
    return { valid: false, message: 'Password cannot contain spaces.' };
  }
  if (!/[A-Z]/.test(normalized)) {
    return { valid: false, message: 'Password must include at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(normalized)) {
    return { valid: false, message: 'Password must include at least one lowercase letter.' };
  }
  if (!/\d/.test(normalized)) {
    return { valid: false, message: 'Password must include at least one number.' };
  }
  if (!/[^A-Za-z0-9]/.test(normalized)) {
    return { valid: false, message: 'Password must include at least one special character.' };
  }
  if (localPart && localPart.length >= 3 && normalized.toLowerCase().includes(localPart)) {
    return { valid: false, message: 'Password should not contain your email name.' };
  }
  return { valid: true };
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = String(storedHash || '').split(':');
    if (!salt || !hash) return false;

    const verifyHash = crypto.pbkdf2Sync(String(password), salt, 120000, 64, 'sha512').toString('hex');
    const left = Buffer.from(hash, 'hex');
    const right = Buffer.from(verifyHash, 'hex');

    if (left.length !== right.length) return false;
    return crypto.timingSafeEqual(left, right);
  } catch {
    return false;
  }
}

module.exports = {
  PASSWORD_RULES,
  validatePassword,
  hashPassword,
  verifyPassword
};
