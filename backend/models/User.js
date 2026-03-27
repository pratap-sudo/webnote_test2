// -------------------- models/User.js --------------------
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  channelHandle: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  channelLogoUrl: { type: String, default: '' },
  files: { type: [mongoose.Schema.Types.Mixed], default: [] },
  isAdmin: { type: Boolean, default: false },
  isDisabled: { type: Boolean, default: false },
  disabledAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
