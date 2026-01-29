// -------------------- controllers/userController.js --------------------
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');


exports.registerUser = async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    await User.create({ name: req.body.name, email: req.body.email, password: hashed });
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ message: 'Email already exists' });
  }
};

exports.loginUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (!(await bcrypt.compare(req.body.password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: jwt.sign({ id: user._id }, process.env.JWT_SECRET) });
};

exports.getUserFiles = async (req, res) => {
  res.json({ files: req.user.files });
};

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const filePath = `user-${req.user._id}/${Date.now()}-${req.file.originalname}`;
    const { error } = await supabase.storage.from('uploads').upload(filePath, req.file.buffer, { contentType: req.file.mimetype });
    if (error) return res.status(500).json({ message: error.message });
    const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
    req.user.files.push(data.publicUrl);
    await req.user.save();
    res.json({ message: 'File uploaded', url: data.publicUrl });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
};


exports.deleteFile = async (req, res) => {
  try {
    if (!req.body.fileUrl) return res.status(400).json({ message: 'File URL required' });
    const filePath = req.body.fileUrl.split('/storage/v1/object/public/uploads/')[1];
    if (!filePath) return res.status(400).json({ message: 'Invalid file URL' });
    const { error } = await supabase.storage.from('uploads').remove([filePath]);
    if (error) return res.status(500).json({ message: error.message });
    req.user.files = req.user.files.filter(file => file !== req.body.fileUrl);
    await req.user.save();
    res.json({ message: 'File deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
};

