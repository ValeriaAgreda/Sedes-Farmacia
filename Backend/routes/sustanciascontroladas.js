// routes/sustanciasControladas.js
const { Router } = require('express');
const router = Router();
const db = require('../database');

// Obtener todas las sustancias controladas activas
router.get('/', (req, res) => {
    db.query('SELECT * FROM SustanciasControladas WHERE status = 1;', (error, rows) => {
        if (error) {
            console.error('Error fetching sustancias controladas:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});

// Obtener una sustancia controlada por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM SustanciasControladas WHERE id = ? AND status = 1;', [id], (error, rows) => {
        if (error) {
            console.error(`Error fetching sustancia controlada with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Sustancia controlada not found' });
        }
        res.json(rows[0]);
    });
});

// Crear una nueva sustancia controlada
router.post('/', (req, res) => {
    const { nombre } = req.body;
    db.query('INSERT INTO SustanciasControladas (nombre, status) VALUES (?, ?);',
        [nombre, 1], (error, result) => {
            if (error) {
                console.error('Error creating sustancia controlada:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ Status: 'Sustancia controlada saved', id: result.insertId });
        });
});

// Actualizar una sustancia controlada por ID
router.put('/:id', (req, res) => {
    const { nombre } = req.body;
    const { id } = req.params;
    db.query('UPDATE SustanciasControladas SET nombre = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
        [nombre, id], (error, result) => {
            if (error) {
                console.error(`Error updating sustancia controlada with ID ${id}:`, error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Sustancia controlada not found' });
            }
            res.json({ Status: 'Sustancia controlada updated' });
        });
});

// Eliminar una sustancia controlada por ID (marcar como inactiva)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE SustanciasControladas SET status = 0 WHERE id = ?;', [id], (error, result) => {
        if (error) {
            console.error(`Error deleting sustancia controlada with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Sustancia controlada not found' });
        }
        res.json({ Status: 'Sustancia controlada deleted' });
    });
});

module.exports = router;
