// routes/zona.js
const { Router } = require('express');
const router = Router();
const db = require('../database');

// Obtener todas las zonas activas
router.get('/', (req, res) => {
    db.query('SELECT * FROM Zona WHERE status = 1;', (error, rows) => {
        if (error) {
            console.error('Error fetching zonas:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});

// Obtener una zona por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM Zona WHERE id = ? AND status = 1;', [id], (error, rows) => {
        if (error) {
            console.error(`Error fetching zona with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Zona not found' });
        }
        res.json(rows[0]);
    });
});

// Obtener todas las zonas de un municipio específico
router.get('/municipio/:municipio_id', (req, res) => {
    const { municipio_id } = req.params;
    db.query('SELECT * FROM Zona WHERE municipio_id = ? AND status = 1;', [municipio_id], (error, rows) => {
        if (error) {
            console.error(`Error fetching zonas for municipio with ID ${municipio_id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No zonas found for this municipio' });
        }
        res.json(rows);
    });
});

// Crear una nueva zona
router.post('/', (req, res) => {
    const { nombre, municipio_id } = req.body;
    db.query('INSERT INTO Zona (nombre, municipio_id, status) VALUES (?, ?, ?);',
        [nombre, municipio_id, 1], (error, result) => {
            if (error) {
                console.error('Error creating zona:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ Status: 'Zona saved', id: result.insertId });
        });
});

// Actualizar una zona por ID
router.put('/:id', (req, res) => {
    const { nombre, municipio_id } = req.body;
    const { id } = req.params;
    db.query('UPDATE Zona SET nombre = ?, municipio_id = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
        [nombre, municipio_id, id], (error, result) => {
            if (error) {
                console.error(`Error updating zona with ID ${id}:`, error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Zona not found' });
            }
            res.json({ Status: 'Zona updated' });
        });
});

// Eliminar una zona por ID (marcar como inactiva)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE Zona SET status = 0 WHERE id = ?;', [id], (error, result) => {
        if (error) {
            console.error(`Error deleting zona with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Zona not found' });
        }
        res.json({ Status: 'Zona deleted' });
    });
});

module.exports = router;
