const express = require('express');
const { adminLogin, getAllUsers, deleteUser, getDashboardStats, toggleAdminStatus, getSystemStats } = require('../controllers/adminController');
const adminProtect = require('../middleware/adminMiddleware');

const router = express.Router();

router.post('/login', adminLogin);
router.get('/stats', adminProtect, getDashboardStats);
router.get('/system-stats', adminProtect, getSystemStats);
router.get('/users', adminProtect, getAllUsers);
router.delete('/users/:userId', adminProtect, deleteUser);
router.patch('/users/:userId/toggle-admin', adminProtect, toggleAdminStatus);

module.exports = router;
