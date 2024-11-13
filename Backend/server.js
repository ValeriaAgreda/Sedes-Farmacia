const express = require('express');
const cors = require('cors');
const app = express();
const port = 8082;


// Middlewares
app.use(cors({
    origin: 'http://localhost:5173' // Ajusta el puerto según el frontend
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Importar las rutas
const farmaciaRoutes = require('./routes/farmacia.js');
const horasRoutes = require('./routes/horas.js');
const sectorRoutes = require('./routes/sector');
const obsRoutes = require('./routes/obs.js');
const redRoutes = require('./routes/red.js');
const municipioRoutes = require('./routes/Municipio.js');
const zonaRoutes = require('./routes/Zona.js');
const categoriaRoutes = require('./routes/categoria.js');
const sustanciasControladasRoutes = require('./routes/sustanciascontroladas.js');
const usuarioruta = require('./routes/usuario.js');
const duenoruta = require('./routes/dueno.js');
const codigoruta = require('./routes/codigo.js');

app.use('/sector', sectorRoutes);
app.use('/obs', obsRoutes);
app.use('/farmacia', farmaciaRoutes);
app.use('/horas', horasRoutes);
app.use('/red', redRoutes);
app.use('/municipio', municipioRoutes);
app.use('/zona', zonaRoutes);
app.use('/categoria', categoriaRoutes);
app.use('/sustancias-controladas', sustanciasControladasRoutes);
app.use('/usuario', usuarioruta);
app.use('/dueno', duenoruta);
app.use('/codigo', codigoruta);

// Ruta base para verificar el servidor
app.get('/', (req, res) => {
  res.status(200).json('Server on port 8082 and database is connected');
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
