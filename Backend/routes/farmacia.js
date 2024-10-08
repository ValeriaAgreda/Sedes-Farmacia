const { Router } = require('express');
const router = Router();
const db = require('../database');

// Ruta base para verificar el servidor
router.get('/', (req, res) => {
  res.status(200).json('Server on port 8081 and database is connected');
});

// Obtener todas las farmacias activas
router.get('/all', (req, res) => {
  db.query('SELECT * FROM Farmacia WHERE status = 1;', (error, rows) => {
    if (error) {
      console.error('Error fetching farmacias:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});
// Ruta para obtener horas de entrada y salida para una farmacia específica
router.get('/:id/horas', (req, res) => {
  const { id } = req.params;

  // Consulta SQL ajustada
  db.query(`
    SELECT h.id, h.nombre, h.hora_entrada, h.hora_salida
    FROM Horas h
    INNER JOIN Farmacia_Horas fh ON h.id = fh.hora_id
    WHERE fh.farmacia_id = ? AND h.status = 1;
  `, [id], (error, rows) => {
      if (error) {
          console.error('Error al obtener las horas:', error);
          return res.status(500).json({ error: 'Internal server error' });
      }

      if (rows.length === 0) {
          return res.status(404).json({ error: 'No se encontraron horas para esta farmacia' });
      }

      res.json(rows);
  });
});



// Obtener una farmacia por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM Farmacia WHERE id = ? AND status = 1;', [id], (error, rows) => {
    if (error) {
      console.error(`Error fetching farmacia with ID ${id}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Farmacia not found' });
    }
    res.json(rows[0]);
  });
});

// Crear una nueva farmacia
router.post('/', (req, res) => {
  const { nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, nit, zona_id, sector_id, obs_id, dueno_id, tipo_id } = req.body;
  db.query('INSERT INTO Farmacia(nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, nit, status, zona_id, sector_id, obs_id, dueno_id, tipo_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
    [nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, nit, 1, zona_id, sector_id, obs_id, dueno_id, tipo_id], (error, result) => {
      if (error) {
        console.error('Error creating farmacia:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json({ Status: 'Farmacia saved', id: result.insertId });
    });
});

// Actualizar una farmacia por ID
router.put('/:id', (req, res) => {
  const { nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, nit, zona_id, sector_id, obs_id, dueno_id, tipo_id } = req.body;
  const { id } = req.params;
  db.query('UPDATE Farmacia SET nombre = ?, numero_registro = ?, direccion = ?, latitud = ?, longitud = ?, fecha_registro = ?, razon_social = ?, nit = ?, zona_id = ?, sector_id = ?, obs_id = ?, dueno_id = ?, tipo_id = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
    [nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, nit, zona_id, sector_id, obs_id, dueno_id, tipo_id, id], (error, result) => {
      if (error) {
        console.error(`Error updating farmacia with ID ${id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Farmacia not found' });
      }
      res.json({ Status: 'Farmacia updated' });
    });
});

// Eliminar una farmacia por ID (marcar como inactiva)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE Farmacia SET status = 0 WHERE id = ?;', [id], (error, result) => {
    if (error) {
      console.error(`Error deleting farmacia with ID ${id}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Farmacia not found' });
    }
    res.json({ Status: 'Farmacia deleted' });
  });
});

module.exports = router;
