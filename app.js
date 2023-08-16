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


// Inicio del servidor
const puerto = 3000;
app.listen(puerto, () => {
    console.log(`Servidor escuchando en el puerto ${puerto}`);
});