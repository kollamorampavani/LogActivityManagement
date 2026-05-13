const pool = require('../config/db');

exports.getAllLogs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT l.*, u.name as student_name, u.email as student_email 
            FROM logs l 
            JOIN users u ON l.student_id = u.id 
            ORDER BY l.created_at DESC
        `);
        
        const logsWithDetails = await Promise.all(result.rows.map(async (log) => {
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

exports.getAllStudents = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT id, name, email, created_at 
            FROM users 
            WHERE role = 'student' 
            ORDER BY created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addComment = async (req, res) => {
    const { log_id, comment } = req.body;
    const admin_id = req.user.id;
    try {
        const newComment = await pool.query(
            'INSERT INTO comments (log_id, admin_id, comment) VALUES ($1, $2, $3) RETURNING *',
            [log_id, admin_id, comment]
        );
        res.status(201).json(newComment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.addReaction = async (req, res) => {
    const { log_id, reaction_type } = req.body;
    const admin_id = req.user.id;
    try {
        // check if admin already reacted to this log, if so update it
        const check = await pool.query('SELECT * FROM reactions WHERE log_id = $1 AND admin_id = $2', [log_id, admin_id]);
        if (check.rows.length > 0) {
            const updatedReaction = await pool.query(
                'UPDATE reactions SET reaction_type = $1 WHERE log_id = $2 AND admin_id = $3 RETURNING *',
                [reaction_type, log_id, admin_id]
            );
            return res.json(updatedReaction.rows[0]);
        }

        const newReaction = await pool.query(
            'INSERT INTO reactions (log_id, admin_id, reaction_type) VALUES ($1, $2, $3) RETURNING *',
            [log_id, admin_id, reaction_type]
        );
        res.status(201).json(newReaction.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error' });
    }
};
