const express = require('express');
const ciudad = express.Router();
const db = require('../db/conn');

ciudad.post('/', (req, res) => {
    if (!req.body.nombre) {
        res.status(400).json({ error: 'Falta el campo nombre' });
        return;
    }

    const nombreciudad = req.body.nombre;

    let datos = [nombreciudad];

    let sql = `INSERT INTO tbl_ciudad (nombre) VALUES ($1) RETURNING id_ciudad`;

    db.one(sql, datos)
        .then(data => {
            const objetoCreado = {
                id_ciudad: data.id_ciudad,
                nombre: nombreciudad,
            };
            res.json(objetoCreado);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});

ciudad.get('/', (req, res) => {
    let sql = "SELECT * FROM tbl_ciudad  where activo = true";

    db.any(sql, e => e.id)
        .then(rows => {
            res.setHeader('Content-Type', 'application/json');
            res.json(rows);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});

ciudad.put('/:id', (req, res) => {
    const idciudad = req.params.idciudad;
    const { nombre } = req.body;

    const parametros = [nombre, idciudad];

    const sql = `
      UPDATE tbl_ciudad 
      SET nombre = $1
      WHERE id_ciudad = $2
    `;

    db.query(sql, parametros)
        .then(data => {
            const objetoModificado = {
                id_ciudad: idciudad,
                nombre: nombre
            };

            res.json(objetoModificado);
        });
});

ciudad.delete('/:id', async (req, res) => {
    try {
        const sql = `
            UPDATE tbl_ciudad
            SET activo = false, fecha_borra = current_timestamp
            WHERE id_ciudad = $1
            RETURNING id_ciudad, fecha_borrado
        `;
        
        const data = await db.oneOrNone(sql, [req.params.id]);

        if (data) {
            res.json({
                id_ciudad: data.id_ciudad,
                activo: false,
                fecha_borra: data.fecha_borra
            });
        } else {
            res.status(404).json({ error: 'Registro no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});







module.exports = ciudad;