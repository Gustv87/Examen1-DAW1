const express = require('express');
const pais = express.Router();
const db = require('../db/conn');
pais.post('/', (req, res) => {
    if (typeof req.body.nombre !== 'string') {
        res.status(400).json({ error: 'El campo nombre debe ser una cadena de caracteres' });
        return;
    }
    const nombrePais = String(req.body.nombre);
    let datos = [nombrePais];
    let sql = `INSERT INTO tbl_pais (nombre) VALUES ($1) RETURNING id_pais`;
    db.one(sql, datos)
        .then(data => {
            const objetoCreado = {
                id_pais: data.id_pais,
                nombre: nombrePais,
            };
            res.json(objetoCreado);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
pais.get('/', (req, res) => {
    let sql = "SELECT * FROM tbl_pais WHERE activo = true LIMIT 100";
    db.any(sql)
        .then(rows => {
            res.setHeader('Content-Type', 'application/json');
            res.json(rows);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
pais.put('/:id', (req, res) => {
    const idPais = req.params.id;
    const { nombre } = req.body;
    if (typeof nombre !== 'string') {
        res.status(400).json({ error: 'El campo nombre debe ser una cadena de caracteres' });
        return;
    }
    const parametros = [nombre, idPais];
    const sql = `
      UPDATE tbl_pais 
      SET nombre = $1
      WHERE id_pais = $2
    `;
    db.query(sql, parametros)
        .then(data => {
            const objetoModificado = {
                id_pais: idPais,
                nombre: nombre
            };
            res.json(objetoModificado);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
pais.delete('/:id', async (req, res) => {
    try {
        const sql = `
            UPDATE tbl_pais
            SET activo = false, fecha_borra = current_timestamp
            WHERE id_pais = $1
            RETURNING id_pais, fecha_borra
        `;
        const data = await db.oneOrNone(sql, [req.params.id]);
        if (data) {
            res.json({
                id_pais: data.id_pais,
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
module.exports = pais;