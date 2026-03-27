const express = require('express');
const {
  adminLogin,
  getAllUsers,
  getUserDetails,
  deleteUser,
  getDashboardStats,
  toggleAdminStatus,
  toggleUserDisable,
  getSystemStats,
  getAuditLogs,
} = require('../controllers/adminController');
const adminProtect = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/stats', adminProtect, getDashboardStats);
router.get('/system-stats', adminProtect, getSystemStats);
router.get('/audit-logs', adminProtect, getAuditLogs);
router.get('/users', adminProtect, getAllUsers);
router.get('/users/:userId', adminProtect, getUserDetails);
router.delete('/users/:userId', adminProtect, deleteUser);
router.patch('/users/:userId/toggle-admin', adminProtect, toggleAdminStatus);
router.patch('/users/:userId/toggle-disable', adminProtect, toggleUserDisable);

module.exports = router;
