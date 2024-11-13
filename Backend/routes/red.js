// routes/red.js
const { Router } = require('express');
const router = Router();
const db = require('../database');

// Obtener todas las redes activas
router.get('/', (req, res) => {
    db.query('SELECT * FROM Red WHERE status = 1;', (error, rows) => {
        if (error) {
            console.error('Error fetching redes:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});

// Obtener una red por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM Red WHERE id = ? AND status = 1;', [id], (error, rows) => {
        if (error) {
            console.error(`Error fetching red with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Red not found' });
        }
        res.json(rows[0]);
    });
});

// Crear una nueva red
router.post('/', (req, res) => {
    const { nombre } = req.body;
    db.query('INSERT INTO Red (nombre, status) VALUES (?, ?);',
        [nombre, 1], (error, result) => {
            if (error) {
                console.error('Error creating red:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ Status: 'Red saved', id: result.insertId });
        });
});

// Actualizar una red por ID
router.put('/:id', (req, res) => {
    const { nombre } = req.body;
    const { id } = req.params;
    db.query('UPDATE Red SET nombre = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
        [nombre, id], (error, result) => {
            if (error) {
                console.error(`Error updating red with ID ${id}:`, error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Red not found' });
            }
            res.json({ Status: 'Red updated' });
        });
});

// Eliminar una red por ID (marcar como inactiva)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE Red SET status = 0 WHERE id = ?;', [id], (error, result) => {
        if (error) {
            console.error(`Error deleting red with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Red not found' });
        }
        res.json({ Status: 'Red deleted' });
    });
});

module.exports = router;
