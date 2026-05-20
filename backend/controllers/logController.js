const pool = require('../config/db');

const isValidDate = (dateString) => {
    if (!dateString) return false;
    const dateObj = new Date(dateString);
    if (isNaN(dateObj)) return false;
    
    // dateString is typically YYYY-MM-DD or a JS Date string
    const dStr = typeof dateString === 'string' && dateString.includes('T') ? dateString.split('T')[0] : 
                 (typeof dateString === 'object' ? dateString.toISOString().split('T')[0] : dateString);
                 
    const [year, month, day] = dStr.split('-');
    const logDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = logDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays >= -1 && diffDays <= 1;
};

exports.addLog = async (req, res) => {
    const { title, description, category, status, date } = req.body;
    const student_id = req.user.id;
    try {
        const logDate = date || new Date().toISOString().split('T')[0];
        if (!isValidDate(logDate)) {
            return res.status(400).json({ message: 'You can only add logs for Yesterday, Today, or Tomorrow.' });
        }

        const newLog = await pool.query(
            'INSERT INTO logs (student_id, title, description, category, status, log_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [student_id, title, description, category || 'Internship', status || 'pending', logDate]
        );
        res.status(201).json(newLog.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOwnLogs = async (req, res) => {
    const student_id = req.user.id;
    const { date } = req.query;
    try {
        let logs;
        if (date) {
            logs = await pool.query(
                'SELECT * FROM logs WHERE student_id = $1 AND log_date = $2 ORDER BY created_at DESC',
                [student_id, date]
            );
        } else {
            logs = await pool.query(
                'SELECT * FROM logs WHERE student_id = $1 ORDER BY log_date DESC, created_at DESC',
                [student_id]
            );
        }
        
        // Fetch comments and reactions for each log
        const logsWithDetails = await Promise.all(logs.rows.map(async (log) => {
            const comments = await pool.query('SELECT c.*, u.name as admin_name FROM comments c JOIN users u ON c.admin_id = u.id WHERE c.log_id = $1', [log.id]);
            const reactions = await pool.query('SELECT r.*, u.name as admin_name FROM reactions r JOIN users u ON r.admin_id = u.id WHERE r.log_id = $1', [log.id]);
            return { ...log, comments: comments.rows, reactions: reactions.rows };
        }));

        res.json(logsWithDetails);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.editLog = async (req, res) => {
    const { id } = req.params;
    const { title, description, category, status, date } = req.body;
    const student_id = req.user.id;
    try {
        // Check ownership
        const logCheck = await pool.query('SELECT * FROM logs WHERE id = $1 AND student_id = $2', [id, student_id]);
        if (logCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Log not found or unauthorized' });
        }

        const existingLogDate = logCheck.rows[0].log_date;
        if (existingLogDate && !isValidDate(existingLogDate)) {
            return res.status(400).json({ message: 'You cannot edit past or future logs beyond tomorrow.' });
        }

        const newLogDate = date || existingLogDate;
        if (newLogDate && !isValidDate(newLogDate)) {
            return res.status(400).json({ message: 'You can only edit logs for Yesterday, Today, or Tomorrow.' });
        }

        const updatedLog = await pool.query(
            'UPDATE logs SET title = $1, description = $2, category = $3, status = $4, log_date = $5 WHERE id = $6 AND student_id = $7 RETURNING *',
            [title, description, category, status, newLogDate, id, student_id]
        );
        res.json(updatedLog.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteLog = async (req, res) => {
    const { id } = req.params;
    const student_id = req.user.id;
    try {
        // Delete related comments and reactions first
        await pool.query('DELETE FROM comments WHERE log_id = $1', [id]);
        await pool.query('DELETE FROM reactions WHERE log_id = $1', [id]);

        const deletedLog = await pool.query('DELETE FROM logs WHERE id = $1 AND student_id = $2 RETURNING *', [id, student_id]);
        if (deletedLog.rows.length === 0) {
            return res.status(404).json({ message: 'Log not found or unauthorized' });
        }
        res.json({ message: 'Log deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
