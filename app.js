const express = require('express');
const app = express();
app.use(express.json());

//Rutas
const ciudad = require('./routes/ciudad.js');
app.use('/api/ciudad', ciudad);

const factura = require('./routes/factura.js');
app.use('/api/factura', factura);

const pais = require('./routes/pais.js');
app.use('/api/pais', pais);

const direccion = require('./routes/direccion.js');
app.use('/api/direccion', direccion);

const rol = require('./routes/rol.js');
app.use('/api/rol', rol);

const usuario = require('./routes/usuario.js');
app.use('/api/usuario', usuario);

// Inicio del servidor
const puerto = 3000;
app.listen(puerto, () => {
    console.log(`Servidor escuchando en el puerto ${puerto}`);
});