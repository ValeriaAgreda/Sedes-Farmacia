const { Router } = require('express');
const router = Router();
const MysqlConnection = require('../database');
const nodemailer = require('nodemailer');


router.get('/enviarturnos', (req, res) => {
    MysqlConnection.query(`
        SELECT d.gmail, d.nombre AS nombre_dueno, f.nombre AS nombre_farmacia, h.dia_turno
        FROM dueno d
        JOIN farmacia f ON d.id = f.dueno_id
        JOIN farmacia_horas fh ON f.id = fh.farmacia_id
        JOIN horas h ON fh.hora_id = h.id
        WHERE d.gmail IS NOT NULL AND d.gmail != '';
    `, (err, results) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).send({ error: 'Error en la consulta de la base de datos' });
        }

        // Verifica si los resultados existen
        if (!results || results.length === 0) {
            console.log('No se encontraron turnos');
            return res.status(404).send('No hay turnos para enviar');
        }

        // Configura el transporte de nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: '2000victorhugotapialeon@gmail.com', // Tu correo de Gmail
                pass: 'dnst anvw ximo alsn' // Tu contraseña de Gmail
            }
        });

        // Envía los correos de manera concurrente
        const emailPromises = results.map(async (turno) => {
            const { gmail, nombre_dueno, nombre_farmacia, dia_turno } = turno;

            // Verifica si el correo electrónico es válido
            if (!gmail) {
                console.log(`No se enviará correo a ${nombre_dueno} porque el correo es nulo`);
                return; // Salta a la siguiente iteración si el correo es nulo
            }

            const mailOptions = {
                from: '2000victorhugotapialeon@gmail.com', // Tu correo de Gmail
                to: gmail,  // Dirección de correo del dueño
                subject: `Asignación de turno - ${nombre_farmacia}`,  // Asunto del correo
                text: `Estimado/a ${nombre_dueno},\n\nLe informamos que se ha asignado un turno a la farmacia ${nombre_farmacia} para el día ${new Date(dia_turno).toLocaleDateString('es-ES', {
                    weekday: 'long', // Día de la semana completo
                    year: 'numeric', // Año completo
                    month: 'long', // Mes completo
                    day: 'numeric', // Día numérico
                })}.\n\nAtentamente,\nEl equipo de Sedes Farmacias.`  // Cuerpo del correo
            };
            

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Correo enviado a ${gmail} para ${nombre_farmacia}`);
            } catch (emailError) {
                console.error(`Error al enviar correo a ${gmail}: ${emailError.message}`);
            }
        });

        

        res.send('Correos enviados correctamente');
    });
});










// Obtener todas las horas activas
router.get('/', (req, res) => {
    MysqlConnection.query('SELECT * FROM Horas WHERE status = 1;', (error, rows) => {
        if (error) {
            console.error('Error fetching active hours:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});

// Obtener una hora por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    MysqlConnection.query('SELECT * FROM Horas WHERE id = ? AND status = 1;', [id], (error, rows) => {
        if (error) {
            console.error(`Error fetching hour with ID ${id}:`, error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Hora not found' });
        }
        res.json(rows[0]);
    });
});

// Crear una nueva hora
router.post('/', (req, res) => {
    const { nombre, hora_entrada, hora_salida, dia_turno, turno } = req.body;

    if (!nombre || !hora_entrada || !hora_salida || !dia_turno) {
        return res.status(400).json({ error: 'Nombre, hora_entrada, hora_salida y dia_turno son requeridos' });
    }

    MysqlConnection.query(
        'INSERT INTO Horas (nombre, hora_entrada, hora_salida, dia_turno, turno, status) VALUES (?, ?, ?, ?, ?, 1);',
        [nombre, hora_entrada, hora_salida, dia_turno, turno || 0],
        (error, result) => {
            if (error) {
                console.error('Error creating hour:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ Status: 'Hora saved', id: result.insertId });
        });
});

// Actualizar una hora por ID
router.put('/:id', (req, res) => {
    const { nombre, hora_entrada, hora_salida, dia_turno, turno } = req.body;
    const { id } = req.params;

    if (!nombre || !hora_entrada || !hora_salida || !dia_turno) {
        return res.status(400).json({ error: 'Nombre, hora_entrada, hora_salida y dia_turno son requeridos' });
    }

    MysqlConnection.query(
        'UPDATE Horas SET nombre = ?, hora_entrada = ?, hora_salida = ?, dia_turno = ?, turno = ?, last_update = CURRENT_TIMESTAMP WHERE id = ? AND status = 1;',
        [nombre, hora_entrada, hora_salida, dia_turno, turno || 0, id],
        (error, result) => {
            if (error) {
                console.error(`Error updating hour with ID ${id}:`, error);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Hora not found' });
            }
            res.json({ Status: 'Hora updated' });
        });
});

// Crear turnos y relaciones con farmacias
router.post('/guardarTurnos', (req, res) => {
    const { farmacias, mesActual, anioActual } = req.body;

    if (!Array.isArray(farmacias) || farmacias.length === 0) {
        return res.status(400).json({ error: 'Se requiere un arreglo de farmacias válido' });
    }

    let turnosGenerados = [];
    let relacionFarmaciaHoras = [];

    // Genera turnos en el formato correcto sin arrays anidados
    farmacias.forEach((farmacia) => {
        turnosGenerados.push([
            farmacia.nombre,
            farmacia.hora_entrada,
            farmacia.hora_salida,
            farmacia.dia_turno,
            farmacia.turno,
            1 // status
        ]);
        
        // Almacena las relaciones en el formato correcto para evitar duplicados
        relacionFarmaciaHoras.push([farmacia.id, null]); // 'null' se usará para el id de la hora que se asignará más adelante
    });

    const insertHorasQuery = 'INSERT INTO Horas (nombre, hora_entrada, hora_salida, dia_turno, turno, status) VALUES ?';
    MysqlConnection.query(insertHorasQuery, [turnosGenerados], (error, horasResult) => {
        if (error) {
            return res.status(500).json({ error: 'Error al guardar turnos en Horas', details: error.message });
        }

        // Obtener el primer ID insertado y asignar los ids correspondientes
        const firstId = horasResult.insertId;
        relacionFarmaciaHoras = relacionFarmaciaHoras.map((relacion, index) => [
            relacion[0], // farmacia_id
            firstId + index // hora_id
        ]);

        const insertRelacionQuery = 'INSERT INTO Farmacia_Horas (farmacia_id, hora_id) VALUES ?';
        MysqlConnection.query(insertRelacionQuery, [relacionFarmaciaHoras], (errorRelacion) => {
            if (errorRelacion) {
                return res.status(500).json({ error: 'Error al vincular farmacias y turnos', details: errorRelacion.message });
            }
            res.json({ message: 'Turnos y relaciones guardados exitosamente' });
        });
    });
});


// Ruta para obtener turnos por código y mes
router.get('/turnosZonaMes/:codigoId/:mes/:anio', (req, res) => {
    const { codigoId, mes, anio } = req.params;

    const query = `
        SELECT h.dia_turno, h.hora_entrada, h.hora_salida, f.nombre AS farmacia_nombre, f.direccion, c.nombre AS codigo_nombre, c.id AS codigo_zona
        FROM Horas h
        JOIN Farmacia_Horas fh ON h.id = fh.hora_id
        JOIN Farmacia f ON fh.farmacia_id = f.id
        JOIN Codigo c ON f.codigo_id = c.id
        WHERE c.id = ? AND MONTH(h.dia_turno) = ? AND YEAR(h.dia_turno) = ? AND h.status = 1;
    `;

    MysqlConnection.query(query, [codigoId, mes, anio], (error, rows) => {
        if (error) {
            console.error('Error fetching turns by code and month:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(rows);
    });
});


// Obtener el ID de la última farmacia asignada para un código específico
router.get('/ultimaFarmaciaAsignada/:codigoId', (req, res) => {
    const { codigoId } = req.params;

    const query = `
        SELECT fh.farmacia_id AS lastId
        FROM Farmacia_Horas fh
        JOIN Horas h ON fh.hora_id = h.id
        JOIN Farmacia f ON fh.farmacia_id = f.id
        WHERE f.codigo_id = ? AND h.status = 1
        ORDER BY h.dia_turno DESC LIMIT 1;
    `;

    MysqlConnection.query(query, [codigoId], (error, rows) => {
        if (error) {
            console.error('Error fetching last assigned pharmacy:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (rows.length === 0) {
            return res.json({ lastId: null }); // No hay una farmacia previa asignada
        }
        res.json({ lastId: rows[0].lastId });
    });
});





module.exports = router;
