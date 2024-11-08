const { Router } = require('express');
const router = Router();
const db = require('../database');

// Ruta base para verificar el servidor
router.get('/', (req, res) => {
  res.status(200).json('Server on port 8082 and database is connected');
});

// Ruta para obtener todos los códigos
router.get('/codigoszonas', (req, res) => {
  db.query('SELECT id, nombre FROM codigo;', (error, rows) => {
    if (error) {
      console.error('Error al obtener los sectores:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});
// Ruta para obtener todas las zonas
router.get('/zonas', (req, res) => {
  db.query('SELECT id, nombre FROM zona;', (error, rows) => {
    if (error) {
      console.error('Error al obtener las zonas:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});

// Ruta para obtener todos los sectores
router.get('/sectores', (req, res) => {
  db.query('SELECT MIN(id) AS id, nombre FROM sector GROUP BY nombre;', (error, rows) => {
    if (error) {
      console.error('Error al obtener los sectores:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});




// Ruta para obtener todas las categorías
router.get('/categorias', (req, res) => {
  db.query('SELECT MIN(id) AS id, nombre FROM categoria GROUP BY nombre;', (error, rows) => {
    if (error) {
      console.error('Error al obtener las categorías:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});



//insercion de farmacia si tiene medicamentos controlados
// Ruta para insertar la relación entre farmacia y sustancias controladas
router.post('/farmacia_sustancias', (req, res) => {
  const { farmacia_id, sustancia_id } = req.body;

  const query = `
    INSERT INTO farmacia_sustancias (farmacia_id, sustancia_id) 
    VALUES (?, ?);
  `;

  const values = [farmacia_id, sustancia_id]; // Usamos el sustancia_id dinámico recibido desde el frontend

  db.query(query, values, (error, result) => {
    if (error) {
      console.error('Error al insertar la relación en farmacia_sustancias:', error);
      return res.status(500).json({ error: 'Error interno del servidor al registrar la relación' });
    }
    res.status(201).json({ message: 'Relación registrada exitosamente' });
  });
});


router.post('/nuevafarmacia', (req, res) => {
  try {
    const {
      nombre, 
      numero_registro,
      direccion,
      latitud,
      longitud,
      fecha_registro,
      razon_social,
      nit,
      zona_id,
      tipo,  // Nuevo campo tipo
      codigo_id,
      imagen,
      nombreDueno,
      primer_apellido,
      segundo_apellido,
      carnet_identidad,
      celular,
      horario_atencion // Campo ya existente
    } = req.body;

    // Depuración: Imprimir los valores recibidos antes de las validaciones
    console.log({
      nombre,
      nombreDueno,
      primer_apellido,
      carnet_identidad,
      celular,
      horario_atencion,
      tipo  // Log del nuevo campo
    });

    const queryDueno = `
      INSERT INTO Dueno (nombre, primer_apellido, segundo_apellido, carnet_identidad, celular, status)
      VALUES (?, ?, ?, ?, ?, 1);
    `;

    const valuesDueno = [nombreDueno, primer_apellido, segundo_apellido, carnet_identidad, celular];

    db.query(queryDueno, valuesDueno, (error, result) => {
      if (error) {
        console.error('Error al registrar el dueño:', error);
        return res.status(500).json({ error: 'Error interno del servidor al registrar el dueño', details: error.message });
      }

      const dueno_id = result.insertId;

      // Paso 2: Registrar la farmacia
      const imagenBuffer = imagen ? Buffer.from(imagen.split(',')[1], 'base64') : null;

      const queryFarmacia = `
        INSERT INTO Farmacia (
          nombre, 
          numero_registro, 
          direccion, 
          latitud, 
          longitud, 
          fecha_registro, 
          razon_social, 
          nit, 
          zona_id, 
          tipo,  
          imagen, 
          dueno_id, 
          codigo_id, 
          usuario_id,
          horario_atencion  
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;

      const valuesFarmacia = [
        nombre,
        numero_registro,
        direccion,
        latitud,
        longitud,
        fecha_registro,
        razon_social,
        nit,
        zona_id,
        tipo,  // Valor para el nuevo campo tipo
        imagenBuffer,
        dueno_id,  // ID del dueño registrado
        codigo_id,
        2, // Usuario fijo con ID 2
        horario_atencion // Valor para el nuevo campo
      ];

      db.query(queryFarmacia, valuesFarmacia, (error, result) => {
        if (error) {
          console.error('Error al registrar la farmacia:', error);
          return res.status(500).json({ error: 'Error interno del servidor al registrar la farmacia', details: error.message });
        }

        res.status(201).json({ message: 'Farmacia registrada exitosamente', id: result.insertId });
      });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});



//update 
//obtener farmacia 
// Ruta para obtener los detalles de una farmacia por ID
router.get('/cargarfarmacia/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM Farmacia WHERE id = ?';

  db.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error al obtener los datos de la farmacia:', error);
      return res.status(500).json({ error: 'Error al obtener los datos de la farmacia' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Farmacia no encontrada' });
    }

    res.status(200).json(results[0]);
  });
});
//detalles dueno
// Ruta para obtener los datos del dueño por ID
router.get('/duenofarmacia/:id', (req, res) => {
  const duenoId = req.params.id;

  // Consulta para obtener los datos del dueño por su ID
  const query = `SELECT * FROM Dueno WHERE id = ?`;
  
  db.query(query, [duenoId], (error, results) => {
    if (error) {
      console.error('Error al obtener los datos del dueño:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Dueño no encontrado' });
    }

    // Devolver los datos del dueño en formato JSON
    res.status(200).json(results[0]);
  });
});
//cargar medicamentos controlados en el editar 
router.get('/farmacia_sustancias/:farmacia_id', (req, res) => {
  const { farmacia_id } = req.params;

  const query = `
    SELECT sustancia_id
    FROM farmacia_sustancias
    WHERE farmacia_id = ?
    LIMIT 1;  
  `;

  db.query(query, [farmacia_id], (error, result) => {
    if (error) {
      console.error('Error al obtener sustancia para la farmacia:', error);
      return res.status(500).json({ error: 'Error interno del servidor al obtener la sustancia' });
    }

    // Si no se encuentra ninguna sustancia, podemos devolver una respuesta vacía o un mensaje adecuado
    if (result.length === 0) {
      return res.status(404).json({ message: 'No se encontró sustancia para esta farmacia' });
    }

    // Devolvemos el primer sustancia_id encontrado
    res.status(200).json({ sustancia_id: result[0].sustancia_id });
  });
});


// Ruta para actualizar la farmacia, dueño y sustancias controladas
// Ruta para actualizar la farmacia, dueño y sustancias controladas
router.put('/actualizarfarmacia/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      numero_registro,
      direccion,
      latitud,
      longitud,
      fecha_registro,
      razon_social,
      nit,
      zona_id,
      tipo,  // Nuevo campo tipo
      codigo_id,
      imagen,
      horario_atencion, // Campo ya existente
      nombreDueno,
      primer_apellido,
      segundo_apellido,
      carnet_identidad,
      celular,
      medicamentosControlados
    } = req.body;

    // Paso 1: Actualizar el dueño
    const queryDueno = `
      UPDATE Dueno 
      SET nombre = ?, primer_apellido = ?, segundo_apellido = ?, carnet_identidad = ?, celular = ? 
      WHERE id = (SELECT dueno_id FROM Farmacia WHERE id = ?);
    `;

    const valuesDueno = [nombreDueno, primer_apellido, segundo_apellido, carnet_identidad, celular, id];

    db.query(queryDueno, valuesDueno, (error, result) => {
      if (error) {
        console.error('Error al actualizar el dueño:', error);
        return res.status(500).json({ error: 'Error interno del servidor al actualizar el dueño' });
      }

      // Paso 2: Actualizar la farmacia
      const imagenBuffer = imagen ? Buffer.from(imagen.split(',')[1], 'base64') : null;
      const queryFarmacia = `
        UPDATE Farmacia 
        SET nombre = ?, numero_registro = ?, direccion = ?, latitud = ?, longitud = ?, 
        fecha_registro = ?, razon_social = ?, nit = ?, zona_id = ?, 
        tipo = ?, 
        imagen = ?, codigo_id = ?, horario_atencion = ? 
        WHERE id = ?;
      `;

      const valuesFarmacia = [
        nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, 
        nit, zona_id, tipo, imagenBuffer, codigo_id, horario_atencion, id  // Incluimos el nuevo campo en los valores
      ];

      db.query(queryFarmacia, valuesFarmacia, (error, result) => {
        if (error) {
          console.error('Error al actualizar la farmacia:', error);
          return res.status(500).json({ error: 'Error interno del servidor al actualizar la farmacia' });
        }

        // Paso 3: Actualizar las sustancias controladas
        if (medicamentosControlados == 'Estupefacientes') {
          // Primero eliminar los registros existentes con el mismo farmacia_id
          const deleteQuery = `
            DELETE FROM farmacia_sustancias WHERE farmacia_id = ?;
          `;
        
          db.query(deleteQuery, [id], (deleteError, deleteResult) => {
            if (deleteError) {
              console.error('Error al eliminar las sustancias controladas existentes:', deleteError);
              return res.status(500).json({ error: 'Error interno del servidor al eliminar las sustancias' });
            }
        
            // Luego insertar el nuevo registro
            const querySustancias = `
              INSERT INTO farmacia_sustancias (farmacia_id, sustancia_id) 
              VALUES (?, 1);
            `;
        
            db.query(querySustancias, [id], (insertError, insertResult) => {
              if (insertError) {
                console.error('Error al insertar la nueva sustancia controlada:', insertError);
                return res.status(500).json({ error: 'Error interno del servidor al insertar las sustancias' });
              }
        
              res.status(200).json({ message: 'Farmacia y datos actualizados exitosamente' });
            });
          });
        } 
        else if (medicamentosControlados == 'Psicotrópicos') {
          // Primero eliminar los registros existentes con el mismo farmacia_id
          const deleteQuery = `
            DELETE FROM farmacia_sustancias WHERE farmacia_id = ?;
          `;
        
          db.query(deleteQuery, [id], (deleteError, deleteResult) => {
            if (deleteError) {
              console.error('Error al eliminar las sustancias controladas existentes:', deleteError);
              return res.status(500).json({ error: 'Error interno del servidor al eliminar las sustancias' });
            }
        
            // Luego insertar el nuevo registro
            const querySustancias = `
              INSERT INTO farmacia_sustancias (farmacia_id, sustancia_id) 
              VALUES (?, 2);
            `;
        
            db.query(querySustancias, [id], (insertError, insertResult) => {
              if (insertError) {
                console.error('Error al insertar la nueva sustancia controlada:', insertError);
                return res.status(500).json({ error: 'Error interno del servidor al insertar las sustancias' });
              }
        
              res.status(200).json({ message: 'Farmacia y datos actualizados exitosamente' });
            });
          });
        }
        else if (medicamentosControlados == 'Ambos') {
          // Primero eliminar los registros existentes con el mismo farmacia_id
          const deleteQuery = `
            DELETE FROM farmacia_sustancias WHERE farmacia_id = ?;
          `;
        
          db.query(deleteQuery, [id], (deleteError, deleteResult) => {
            if (deleteError) {
              console.error('Error al eliminar las sustancias controladas existentes:', deleteError);
              return res.status(500).json({ error: 'Error interno del servidor al eliminar las sustancias' });
            }
        
            // Luego insertar el nuevo registro
            const querySustancias = `
              INSERT INTO farmacia_sustancias (farmacia_id, sustancia_id) 
              VALUES (?, 3);
            `;
        
            db.query(querySustancias, [id], (insertError, insertResult) => {
              if (insertError) {
                console.error('Error al insertar la nueva sustancia controlada:', insertError);
                return res.status(500).json({ error: 'Error interno del servidor al insertar las sustancias' });
              }
        
              res.status(200).json({ message: 'Farmacia y datos actualizados exitosamente' });
            });
          });
        }
        
        else if (medicamentosControlados == 'Ninguno') {
          // Eliminar las sustancias controladas asociadas a la farmacia
          const queryEliminarSustancias = `
            DELETE FROM farmacia_sustancias WHERE farmacia_id = ?;
          `;

          db.query(queryEliminarSustancias, [id], (error, result) => {
            if (error) {
              console.error('Error al eliminar las sustancias controladas:', error);
              return res.status(500).json({ error: 'Error interno del servidor al eliminar las sustancias' });
            }

            res.status(200).json({ message: 'Farmacia actualizada exitosamente y sustancias eliminadas' });
          });
        } else {
          res.status(200).json({ message: 'Farmacia actualizada exitosamente' });
        }
      });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});



//eliminacion logica farmacia 
// Ruta para la eliminación lógica de la farmacia
router.put('/farmacia/eliminar/:id', (req, res) => {
  const { id } = req.params;

  const query = `UPDATE Farmacia SET status = 0 WHERE id = ?`;

  db.query(query, [id], (error, result) => {
    if (error) {
      console.error('Error al eliminar farmacia:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.status(200).json({ message: 'Farmacia eliminada lógicamente' });
  });
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
// Obtener todas las farmacias con sustancias controladas
router.get('/farmacias-con-sustancias', (req, res) => {
  db.query(`
    SELECT f.id, f.nombre, f.latitud, f.longitud
    FROM farmacia f
    JOIN farmacia_sustancias fs ON f.id = fs.farmacia_id
    WHERE f.status = 1;
  `, (error, rows) => {
    if (error) {
      console.error('Error fetching farmacias con sustancias:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron farmacias con sustancias controladas' });
    }
    
    // Debug: Verificar los resultados
    console.log('Resultados de la consulta:', rows);
    res.json(rows);
  });
});

// Ruta para obtener farmacias en turno en un día específico, incluyendo latitud y longitud
router.get('/turnosDia/:dia', (req, res) => {
  const { dia } = req.params;

  // Debug: Verificar el valor de 'dia'
  console.log('Día recibido:', dia); // Imprimir el valor de 'dia' en la consola del servidor

  const query = `
      SELECT f.nombre , f.latitud, f.longitud ,f.id
      FROM horas h
      JOIN farmacia_horas fh ON h.id = fh.hora_id
      JOIN farmacia f ON fh.farmacia_id = f.id
      WHERE h.dia_turno = ? AND h.status = 1;
  `;

  db.query(query, [dia], (error, rows) => {
    if (error) {
      console.error('Error fetching pharmacies on duty for the day:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron farmacias para el día especificado' });
    }

    // Debug: Verificar los resultados
    console.log('Resultados de la consulta:', rows);
    res.json(rows);
  });
});

// Ruta para obtener farmacias de turno en un día específico
router.get('/farmacias-de-turno', (req, res) => {
  const diaConsulta = req.query.dia || moment().format('YYYY-MM-DD'); // Día de consulta por defecto hoy

  db.query(`
    SELECT f.id, f.nombre, f.latitud, f.longitud
    FROM farmacia f
    JOIN horas h ON f.id = h.farmacia_id
    WHERE f.status = 1 AND h.turno = 1 AND h.dia = ?;
  `, [diaConsulta], (error, rows) => {
    if (error) {
      console.error('Error al obtener farmacias de turno:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron farmacias de turno para este día' });
    }

    res.json(rows);
  });
});





// Buscar farmacias por nombre o letras iniciales
router.get('/buscar-farmacias', (req, res) => {
  const { nombre } = req.query;

  if (!nombre) {
    return res.status(400).json({ error: 'Debe proporcionar un nombre o parte del nombre para buscar farmacias' });
  }

  const searchQuery = `%${nombre}%`; // Esto permitirá buscar por letras iniciales o cualquier parte del nombre

  db.query(`
    SELECT id, nombre, latitud, longitud
    FROM farmacia
    WHERE nombre LIKE ? AND status = 1;
  `, [searchQuery], (error, rows) => {
    if (error) {
      console.error('Error fetching farmacias:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontraron farmacias con ese nombre' });
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








// Actualizar una farmacia por ID
router.put('/:id', (req, res) => {
  const { nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, nit, zona_id, sector_id, observaciones, dueno_id, tipo_id, codigo_id, usuario_id } = req.body;
  const { id } = req.params;
  db.query(
    'UPDATE Farmacia SET nombre = ?, numero_registro = ?, direccion = ?, latitud = ?, longitud = ?, fecha_registro = ?, razon_social = ?, nit = ?, zona_id = ?, sector_id = ?, observaciones = ?, dueno_id = ?, tipo_id = ?, codigo_id = ?, usuario_id = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
    [nombre, numero_registro, direccion, latitud, longitud, fecha_registro, razon_social, nit, zona_id, sector_id, observaciones, dueno_id, tipo_id, codigo_id, usuario_id, id], 
    (error, result) => {
      if (error) {
        console.error(`Error updating farmacia with ID ${id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Farmacia not found' });
      }
      res.json({ Status: 'Farmacia updated' });
    }
  );
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

// Obtener horas de entrada y salida para una farmacia específica
router.get('/:id/horas', (req, res) => {
  const { id } = req.params;

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

module.exports = router;
