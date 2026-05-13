const pool = require('../config/db');

exports.addLog = async (req, res) => {
    const { title, description, category, status } = req.body;
    const student_id = req.user.id;
    try {
        const newLog = await pool.query(
            'INSERT INTO logs (student_id, title, description, category, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [student_id, title, description, category || 'General', status || 'pending']
        );
        res.status(201).json(newLog.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOwnLogs = async (req, res) => {
    const student_id = req.user.id;
    try {
        const logs = await pool.query(
            'SELECT * FROM logs WHERE student_id = $1 ORDER BY created_at DESC',
            [student_id]
        );
        
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
    const { title, description, category, status } = req.body;
    const student_id = req.user.id;
    try {
        // Check ownership
        const logCheck = await pool.query('SELECT * FROM logs WHERE id = $1 AND student_id = $2', [id, student_id]);
        if (logCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Log not found or unauthorized' });
        }

        const updatedLog = await pool.query(
            'UPDATE logs SET title = $1, description = $2, category = $3, status = $4 WHERE id = $5 AND student_id = $6 RETURNING *',
            [title, description, category, status, id, student_id]
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
