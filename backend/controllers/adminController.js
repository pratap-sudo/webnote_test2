const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const recordAudit = async ({ actor, action, targetUser, meta }) => {
  try {
    await AuditLog.create({
      actorId: actor?._id,
      actorEmail: actor?.email || '',
      action,
      targetUserId: targetUser?._id || null,
      targetEmail: targetUser?.email || '',
      meta: meta || {},
    });
  } catch (err) {
    // audit failures should not block admin actions
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'Admin not found' });
  if (!user.isAdmin) return res.status(403).json({ message: 'Not an admin' });
  if (user.isDisabled) return res.status(403).json({ message: 'Admin account disabled' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, isAdmin: true }, process.env.JWT_SECRET);
  res.json({ token });
};

// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

// Get User Details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    await recordAudit({ actor: req.user, action: 'user.view', targetUser: user });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user' });
  }
};

// Delete User
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await recordAudit({ actor: req.user, action: 'user.delete', targetUser: user });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// Get Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const users = await User.find().select('name email isAdmin isDisabled files createdAt');
    const totalFiles = users.reduce((sum, u) => sum + u.files.length, 0);
    res.json({
      totalUsers: await User.countDocuments(),
      totalAdmins: await User.countDocuments({ isAdmin: true }),
      totalFiles,
      users: users.map(u => ({
        id: u._id,
        name: u.name,
        email: u.email,
        isAdmin: u.isAdmin,
        isDisabled: u.isDisabled,
        fileCount: u.files.length,
        createdAt: u.createdAt,
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// Toggle Admin Status
exports.toggleAdminStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isAdmin = !user.isAdmin;
    await user.save();
    await recordAudit({
      actor: req.user,
      action: user.isAdmin ? 'user.promote' : 'user.demote',
      targetUser: user,
    });
    res.json({ message: 'Admin status updated', isAdmin: user.isAdmin });
  } catch (err) {
    res.status(500).json({ message: 'Error updating admin status' });
  }
};

// Toggle User Disable
exports.toggleUserDisable = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isDisabled = !user.isDisabled;
    user.disabledAt = user.isDisabled ? new Date() : null;
    await user.save();
    await recordAudit({
      actor: req.user,
      action: user.isDisabled ? 'user.disable' : 'user.enable',
      targetUser: user,
    });
    res.json({ message: 'User status updated', isDisabled: user.isDisabled });
  } catch (err) {
    res.status(500).json({ message: 'Error updating user status' });
  }
};

// Get Audit Logs
exports.getAuditLogs = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching audit logs' });
  }
};

// Get System Statistics
exports.getSystemStats = async (req, res) => {
  try {
    const users = await User.find().select('files isAdmin');
    const totalFiles = users.reduce((sum, u) => sum + u.files.length, 0);
    res.json({
      totalUsers: await User.countDocuments(),
      totalAdmins: users.filter(u => u.isAdmin).length,
      activeUsers: await User.countDocuments({ files: { $exists: true, $ne: [] } }),
      totalFiles
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching system stats' });
  }
};
