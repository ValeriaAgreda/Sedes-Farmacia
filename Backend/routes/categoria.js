// routes/categoria.js
const { Router } = require('express');
const router = Router();
const db = require('../database');

// Obtener todas las categorías activas
router.get('/', (req, res) => {
    db.query('SELECT * FROM Categoria WHERE status = 1;', (error, rows) => {
        if (error) {
            console.error('Error fetching categorias:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});

// Obtener una categoría por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM Categoria WHERE id = ? AND status = 1;', [id], (error, rows) => {
        if (error) {
            console.error(`Error fetching categoria with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Categoria not found' });
        }
        res.json(rows[0]);
    });
});

// Crear una nueva categoría
router.post('/', (req, res) => {
    const { nombre } = req.body;
    db.query('INSERT INTO Categoria (nombre, status) VALUES (?, ?);',
        [nombre, 1], (error, result) => {
            if (error) {
                console.error('Error creating categoria:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ Status: 'Categoria saved', id: result.insertId });
        });
});

// Actualizar una categoría por ID
router.put('/:id', (req, res) => {
    const { nombre } = req.body;
    const { id } = req.params;
    db.query('UPDATE Categoria SET nombre = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
        [nombre, id], (error, result) => {
            if (error) {
                console.error(`Error updating categoria with ID ${id}:`, error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Categoria not found' });
            }
            res.json({ Status: 'Categoria updated' });
        });
});

// Eliminar una categoría por ID (marcar como inactiva)
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('UPDATE Categoria SET status = 0 WHERE id = ?;', [id], (error, result) => {
        if (error) {
            console.error(`Error deleting categoria with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Categoria not found' });
        }
        res.json({ Status: 'Categoria deleted' });
    });
});

module.exports = router;
