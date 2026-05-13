const express = require('express');
const { addLog, getOwnLogs, editLog, deleteLog } = require('../controllers/logController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', protect, addLog);
router.get('/mylogs', protect, getOwnLogs);
router.put('/:id', protect, editLog);
router.delete('/:id', protect, deleteLog);

module.exports = router;
