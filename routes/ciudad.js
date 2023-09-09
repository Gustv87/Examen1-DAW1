const express = require('express');
const ciudad = express.Router();
const db = require('../db/conn');

ciudad.post('/', (req, res) => {
    if (!req.body.nombre) {
        res.status(500).json({ error: 'Falta el campo nombre' });
        return;
    }
    const nombreciudad = String(req.body.nombre);
    const idpais = req.body.id_pais;
    let datos = [nombreciudad,idpais];
    let sql = `INSERT INTO tbl_ciudad (nombre,id_pais) VALUES ($1,$2) RETURNING id_ciudad`;
    db.one(sql, datos)
        .then(data => {
            const objetoCreado = {
                id_ciudad: data.id_ciudad,
                nombre: nombreciudad,
                id_pais: idpais
            };
            res.json(objetoCreado);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});


ciudad.get('/', (req, res) => {
    let sql = `
        SELECT c.id_ciudad as id_ciudad, c.nombre as nombre, p.id_pais, p.nombre as nombre_pais 
        FROM tbl_ciudad as c
        INNER JOIN tbl_pais as p ON c.id_pais = p.id_pais
        WHERE c.activo = true`;
        
        
    db.any(sql)
        .then(rows => {
            res.setHeader('Content-Type', 'application/json');
            res.json(rows);
        })
        .catch((error) => {
            console.error('Database Error:', error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});



ciudad.put('/:id', (req, res) => {
    const id_ciudad = req.params.id;

    const { nombre, idpais } = req.body;
    const parametros = [nombre, idpais];
    const sql = `
      UPDATE tbl_ciudad 
      SET nombre = $1,
      WHERE id_pais = $2

      WHERE id_ciudad = $3
    `;
    db.query(sql, parametros)
        .then(data => {
            const objetoModificado = {
                id_ciudad: id_ciudad,
                nombre: nombre,
                id_pais: idpais
            };
            res.json(objetoModificado);
        });
})
ciudad.delete('/:id', async (req, res) => {
    try {
        const sql = `
            UPDATE tbl_ciudad
            SET activo = false, fecha_borra = current_timestamp
            WHERE id_ciudad = $1
            RETURNING id_ciudad, fecha_borra
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