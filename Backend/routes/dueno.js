const { Router } = require('express');
const router = Router();
const db = require('../database');

// Ruta base para verificar el servidor
router.get('/', (req, res) => {
  res.status(200).json('Server on port 8081 and database is connected');
});

// Obtener todos los dueños activos
router.get('/all', (req, res) => {
  db.query('SELECT * FROM Dueno WHERE status = 1;', (error, rows) => {
    if (error) {
      console.error('Error fetching dueños:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

// Obtener un dueño por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM Dueno WHERE id = ? AND status = 1;', [id], (error, rows) => {
    if (error) {
      console.error(`Error fetching dueño with ID ${id}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dueño not found' });
    }
    res.json(rows[0]);
  });
});

// Crear un nuevo dueño
router.post('/', (req, res) => {
  const { nombre, primer_apellido, segundo_apellido, carnet_identidad, celular } = req.body;
  db.query('INSERT INTO Dueno(nombre, primer_apellido, segundo_apellido, carnet_identidad, celular, status) VALUES (?, ?, ?, ?, ?, 1);',
    [nombre, primer_apellido, segundo_apellido, carnet_identidad, celular], (error, result) => {
      if (error) {
        console.error('Error creating dueño:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json({ Status: 'Dueño saved', id: result.insertId });
    });
});

// Actualizar un dueño por ID
router.put('/:id', (req, res) => {
  const { nombre, primer_apellido, segundo_apellido, carnet_identidad, celular } = req.body;
  const { id } = req.params;
  db.query('UPDATE Dueno SET nombre = ?, primer_apellido = ?, segundo_apellido = ?, carnet_identidad = ?, celular = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
    [nombre, primer_apellido, segundo_apellido, carnet_identidad, celular, id], (error, result) => {
      if (error) {
        console.error(`Error updating dueño with ID ${id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Dueño not found' });
      }
      res.json({ Status: 'Dueño updated' });
    });
});

// Eliminar un dueño por ID (marcar como inactivo)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE Dueno SET status = 0 WHERE id = ?;', [id], (error, result) => {
    if (error) {
      console.error(`Error deleting dueño with ID ${id}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Dueño not found' });
    }
    res.json({ Status: 'Dueño deleted' });
  });
});

module.exports = router;
