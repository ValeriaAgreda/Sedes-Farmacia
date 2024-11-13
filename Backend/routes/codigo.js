const { Router } = require('express');
const router = Router();
const db = require('../database');

// Ruta base para verificar el servidor
router.get('/', (req, res) => {
  res.status(200).json('Server on port 8082 and database is connected');
});

// Obtener todos los códigos activos
router.get('/all', (req, res) => {
  db.query('SELECT * FROM Codigo WHERE status = 1;', (error, rows) => {
    if (error) {
      console.error('Error fetching codigos:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});

// Obtener un código por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM Codigo WHERE id = ? AND status = 1;', [id], (error, rows) => {
    if (error) {
      console.error(`Error fetching codigo with ID ${id}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Codigo not found' });
    }
    res.json(rows[0]);
  });
});

// Crear un nuevo código
router.post('/', (req, res) => {
  const { nombre } = req.body;
  db.query('INSERT INTO Codigo (nombre) VALUES (?);', [nombre], (error, result) => {
    if (error) {
      console.error('Error creating codigo:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.status(201).json({ Status: 'Codigo saved', id: result.insertId });
  });
});

// Actualizar un código por ID
router.put('/:id', (req, res) => {
  const { nombre } = req.body;
  const { id } = req.params;
  db.query('UPDATE Codigo SET nombre = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
    [nombre, id], (error, result) => {
      if (error) {
        console.error(`Error updating codigo with ID ${id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Codigo not found' });
      }
      res.json({ Status: 'Codigo updated' });
    });
});

// Eliminar un código por ID (marcar como inactivo)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE Codigo SET status = 0 WHERE id = ?;', [id], (error, result) => {
    if (error) {
      console.error(`Error deleting codigo with ID ${id}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Codigo not found' });
    }
    res.json({ Status: 'Codigo deleted' });
  });
});


// Obtener farmacias activas por codigo_id
// Obtener farmacias activas por codigo_id
router.get('/codigofiltro/:codigo_id', (req, res) => {
  const { codigo_id } = req.params;

  console.log('Codigo ID recibido:', codigo_id);  // Agrega esto para verificar el valor recibido
  db.query(`
    SELECT 
      f.id, 
      f.nombre AS farmacia_nombre,  
      f.direccion,
      f.numero_registro,
      c.nombre AS codigo
    FROM 
      Farmacia f
    JOIN 
      Codigo c ON f.codigo_id = c.id
    WHERE 
      f.codigo_id = ? AND f.status = 1;
  `, [codigo_id], (error, rows) => {
    if (error) {
      console.error('Error fetching farmacias:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No active farmacias found with this codigo' });
    }

    console.log('Resultados de la consulta:', rows);  // Muestra los resultados en la consola
    res.json(rows);
  });
});








module.exports = router;


