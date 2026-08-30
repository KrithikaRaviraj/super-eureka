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

  const $set = {
    email: normalizedEmail,
    updatedAt: new Date()
  };

  const $setOnInsert = {};

  if (uid !== undefined) {
    $set.uid = String(uid || '');
  } else {
    $setOnInsert.uid = '';
  }

  if (name !== undefined) {
    $set.name = String(name || '').trim() || normalizedEmail.split('@')[0] || 'Client';
  } else {
    $setOnInsert.name = normalizedEmail.split('@')[0] || 'Client';
  }

  if (phone !== undefined) {
    $set.phone = phone || null;
  } else {
    $setOnInsert.phone = null;
  }

  if (photoURL !== undefined) {
    $set.photoURL = photoURL || '';
  } else {
    $setOnInsert.photoURL = '';
  }

  if (passwordHash !== undefined) {
    $set.passwordHash = passwordHash || '';
  } else {
    $setOnInsert.passwordHash = '';
  }

  if (passwordSetupAt !== undefined) {
    $set.passwordSetupAt = passwordSetupAt || null;
  } else {
    $setOnInsert.passwordSetupAt = null;
  }

  if (emailVerifiedAt !== undefined) {
    $set.emailVerifiedAt = emailVerifiedAt || null;
  } else {
    $setOnInsert.emailVerifiedAt = null;
  }

  if (
    lastLoginAt !== undefined ||
    lastLoginMethod !== undefined ||
    authProvider !== undefined ||
    lastLoginIp !== undefined ||
    lastLoginTimeZone !== undefined
  ) {
    $set.lastLoginAt = lastLoginAt || new Date();
    if (lastLoginMethod !== undefined) $set.lastLoginMethod = String(lastLoginMethod || '');
    if (authProvider !== undefined) $set.authProvider = String(authProvider || '');
    if (lastLoginIp !== undefined) $set.lastLoginIp = String(lastLoginIp || '');
    if (lastLoginTimeZone !== undefined) $set.lastLoginTimeZone = String(lastLoginTimeZone || '');
  }

  const update = { $set };
  if (Object.keys($setOnInsert).length > 0) {
    update.$setOnInsert = $setOnInsert;
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