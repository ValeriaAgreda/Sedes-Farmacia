const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../database'); // Asegúrate de que tienes acceso a tu base de datos aquí
 
// Ruta base para verificar el servidor
router.get('/', (req, res) => {
  res.status(200).json('Usuario routes working');
});
 
// Obtener todos los usuarios activos
router.get('/all', (req, res) => {
  db.query('SELECT * FROM Usuario WHERE status = 1;', (error, rows) => {
    if (error) {
      console.error('Error fetching usuarios:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    res.json(rows);
  });
});
 
// Obtener un usuario por ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM Usuario WHERE id = ? AND status = 1;', [id], (error, rows) => {
    if (error) {
      console.error(`Error fetching usuario with ID ${id}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario not found' });
    }
    res.json(rows[0]);
  });
});
 
// Crear un nuevo usuario con rol 'normal'
router.post('/', (req, res) => {
  const { user, password, gmail } = req.body;
  const rol = 'normal'; // El rol siempre será 'normal' en este caso
  db.query('INSERT INTO Usuario (user, password, gmail, rol, status) VALUES (?, ?, ?, ?, 1);',
    [user, password, gmail, rol], (error, result) => {
      if (error) {
        console.error('Error creating usuario:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(201).json({ Status: 'Usuario created', id: result.insertId });
    });
});
 
// Actualizar un usuario por ID
router.put('/:id', (req, res) => {
  const { user, password, gmail, rol } = req.body;
  const { id } = req.params;
  db.query('UPDATE Usuario SET user = ?, password = ?, gmail = ?, rol = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
    [user, password, gmail, rol, id], (error, result) => {
      if (error) {
        console.error(`Error updating usuario with ID ${id}:`, error);
        return res.status(500).json({ error: 'Internal server error' });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Usuario not found' });
      }
      res.json({ Status: 'Usuario updated' });
    });
});
 
// Eliminar un usuario por ID (marcar como inactivo)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE Usuario SET status = 0 WHERE id = ?;', [id], (error, result) => {
    if (error) {
      console.error(`Error deleting usuario with ID ${id}:`, error);
      return res.status(500).json({ error: 'Internal server error' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuario not found' });
    }
    res.json({ Status: 'Usuario deleted' });
  });
});
 
// Login de usuario
router.post('/login', (req, res) => {
  const { user, password } = req.body;
 
  // Imprimir datos recibidos para depuración
  console.log('Datos de login:', { user, password });
 
  // Consulta para verificar usuario y contraseña en la base de datos
  db.query('SELECT * FROM Usuario WHERE user = ? AND password = ? AND status = 1;',
  [user, password], (error, rows) => {
    if (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
   
    // Log para ver filas obtenidas
    console.log('Filas obtenidas:', rows);
 
    // Si no hay coincidencias
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }
   
    // Si las credenciales son correctas
    res.json({ Status: 'Login successful', user: rows[0].user });
  });
});
 
// Ruta para recuperación de contraseña
router.post('/recover-password', (req, res) => {
  const { gmail } = req.body;
 
  db.query('SELECT * FROM Usuario WHERE gmail = ? AND status = 1;', [gmail], (error, rows) => {
    if (error) {
      console.error('Error fetching usuario:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
 
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No user found with this gmail' });
    }
 
    const user = rows[0];
 
    // Configuración de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'barrientosnicolas67@gmail.com',
        pass: 'acxd eodt damg fqlv' // Cambia por una contraseña correcta o usa un app password
      }
    });
 
    const mailOptions = {
      from: 'barrientosnicolas67@gmail.com',
      to: user.gmail,
      subject: 'Recuperación de contraseña',
      text: `Hola ${user.user}, tu contraseña es: ${user.password}`
    };
 
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ error: 'Error sending email' });
      }
      res.json({ Status: 'Email sent', info });
    });
  });
});
 
module.exports = router;