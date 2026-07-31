const User = require('../models/User');

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function upsertUserProfile({
  uid,
  email,
  name,
  phone,
  photoURL,
  passwordHash,
  passwordSetupAt,
  emailVerifiedAt,
  lastLoginAt,
  lastLoginMethod,
  authProvider,
  lastLoginIp,
  lastLoginTimeZone
}) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error('email is required');
  }

  const update = {
    $set: {
      email: normalizedEmail,
      updatedAt: new Date()
    },
    $setOnInsert: {
      uid: String(uid || ''),
      name: String(name || '').trim() || normalizedEmail.split('@')[0] || 'Client',
      phone: phone || null,
      photoURL: photoURL || '',
      passwordHash: passwordHash || '',
      passwordSetupAt: passwordSetupAt || null,
      emailVerifiedAt: emailVerifiedAt || null
    }
  };

  if (uid !== undefined) update.$set.uid = String(uid || '');
  if (name !== undefined) update.$set.name = String(name || '').trim() || normalizedEmail.split('@')[0] || 'Client';
  if (phone !== undefined) update.$set.phone = phone || null;
  if (photoURL !== undefined) update.$set.photoURL = photoURL || '';
  if (passwordHash !== undefined) update.$set.passwordHash = passwordHash || '';
  if (passwordSetupAt !== undefined) update.$set.passwordSetupAt = passwordSetupAt || null;
  if (emailVerifiedAt !== undefined) update.$set.emailVerifiedAt = emailVerifiedAt || null;

  if (lastLoginAt || lastLoginMethod || authProvider || lastLoginIp || lastLoginTimeZone) {
    update.$set.lastLoginAt = lastLoginAt || new Date();
    if (lastLoginMethod !== undefined) update.$set.lastLoginMethod = String(lastLoginMethod || '');
    if (authProvider !== undefined) update.$set.authProvider = String(authProvider || '');
    if (lastLoginIp !== undefined) update.$set.lastLoginIp = String(lastLoginIp || '');
    if (lastLoginTimeZone !== undefined) update.$set.lastLoginTimeZone = String(lastLoginTimeZone || '');
  }

  return User.findOneAndUpdate(
    { email: normalizedEmail },
    update,
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

module.exports = {
  upsertUserProfile
};