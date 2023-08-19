const express = require('express');
const ciudad = express.Router();
const db = require('../db/conn');
ciudad.post('/', (req, res) => {
    if (!req.body.nombre) {
        res.status(400).json({ error: 'Falta el campo nombre' });
        return;
    }
    const nombreciudad = req.body.nombre;
    const idpais = req.body.id_pais;
    let datos = [nombreciudad, idpais];
    let sql = `INSERT INTO tbl_ciudad (nombre, id_pais) VALUES ($1, $2) RETURNING id_ciudad, id_pais`;
    db.one(sql, datos)
        .then(data => {
            const objetoCreado = {
                id_ciudad: data.id_ciudad,
                id_pais: data.id_pais,
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
// SELECT * FROM tbl_ciudad as c
//     Inner join tbl pais as p on c.id_ciudad = p.id_pais
//     where c.activo = true`;
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
//
ciudad.put('/:id', (req, res) => {
    const id_ciudad = req.params.id;
    
    const { nombre, idpais} = req.body;
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
                id_pais:idpais
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