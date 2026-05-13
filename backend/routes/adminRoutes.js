const express = require('express');
const { getAllLogs, getAllStudents, addComment, addReaction } = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/logs', protect, adminOnly, getAllLogs);
router.get('/students', protect, adminOnly, getAllStudents);
router.post('/comment', protect, adminOnly, addComment);
router.post('/reaction', protect, adminOnly, addReaction);

module.exports = router;
