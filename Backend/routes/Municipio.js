// routes/municipio.js
const { Router } = require('express');
const router = Router();
const db = require('../database');

// Obtener todos los municipios activos
router.get('/', (req, res) => {
    db.query('SELECT * FROM Municipio WHERE status = 1;', (error, rows) => {
        if (error) {
            console.error('Error fetching municipios:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});

// Obtener un municipio por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM Municipio WHERE id = ? AND status = 1;', [id], (error, rows) => {
        if (error) {
            console.error(`Error fetching municipio with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Municipio not found' });
        }
        res.json(rows[0]);
    });
});

// Obtener todos los municipios de una red específica
router.get('/red/:red_id', (req, res) => {
    const { red_id } = req.params;
    db.query('SELECT * FROM Municipio WHERE red_id = ? AND status = 1;', [red_id], (error, rows) => {
        if (error) {
            console.error(`Error fetching municipios for red with ID ${red_id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No municipios found for this red' });
        }
        res.json(rows);
    });
});

// Crear un nuevo municipio
router.post('/', (req, res) => {
    const { nombre, red_id } = req.body;
    db.query('INSERT INTO Municipio (nombre, red_id, status) VALUES (?, ?, ?);',
        [nombre, red_id, 1], (error, result) => {
            if (error) {
                console.error('Error creating municipio:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ Status: 'Municipio saved', id: result.insertId });
        });
});

// Actualizar un municipio por ID
router.put('/:id', (req, res) => {
    const { nombre, red_id } = req.body;
    const { id } = req.params;
    db.query('UPDATE Municipio SET nombre = ?, red_id = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
        [nombre, red_id, id], (error, result) => {
            if (error) {
                console.error(`Error updating municipio with ID ${id}:`, error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Municipio not found' });
            }
            res.json({ Status: 'Municipio updated' });
        });
});

// Eliminar un municipio por ID (marcar como inactivo)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE Municipio SET status = 0 WHERE id = ?;', [id], (error, result) => {
        if (error) {
            console.error(`Error deleting municipio with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Municipio not found' });
        }
        res.json({ Status: 'Municipio deleted' });
    });
});

module.exports = router;
