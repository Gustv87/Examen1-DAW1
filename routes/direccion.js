const express = require('express');
const direccion = express.Router();
const db = require('../db/conn');
direccion.post('/', (req, res) => {
    if (!req.body.direccion || !req.body.descripcion || !req.body.correo || !req.body.id_ciudad || !req.body.id_pais) {
        res.status(400).json({ error: 'Faltan campos obligatorios' });
        return;
    }
    const { direccion, descripcion, correo, id_ciudad, id_pais } = req.body;
    let datos = [direccion, descripcion, correo, id_ciudad, id_pais];
    let sql = `INSERT INTO tbl_direccion (direccion, descripcion, correo, id_ciudad, id_pais) VALUES ($1, $2, $3, $4, $5) RETURNING id_direccion`;
    db.one(sql, datos)
        .then(data => {
            const objetoCreado = {
                id_direccion: data.id_direccion,
                direccion: direccion,
                descripcion: descripcion,
                correo: correo,
                id_ciudad: id_ciudad,
                id_pais: id_pais
            };
            res.json(objetoCreado);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
direccion.get('/', (req, res) => {
    let sql = "SELECT * FROM tbl_direccion WHERE activo = true";
    db.any(sql)
        .then(rows => {
            res.setHeader('Content-Type', 'application/json');
            res.json(rows);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
direccion.put('/:id', (req, res) => {
    const idDireccion = req.params.id;
    const { direccion, descripcion, id_ciudad, id_pais } = req.body;
    if (!direccion || !descripcion || !id_ciudad || !id_pais) {
        res.status(400).json({ error: 'Faltan campos obligatorios' });
        return;
    }
    const parametros = [direccion, descripcion, id_ciudad, id_pais, idDireccion];
    const sql = `
      UPDATE tbl_direccion 
      SET direccion = $1, descripcion = $2, id_ciudad = $3, id_pais = $4
      WHERE id_direccion = $5
    `;
    db.query(sql, parametros)
        .then(data => {
            const objetoModificado = {
                id_direccion: idDireccion,
                direccion: direccion,
                descripcion: descripcion,
                id_ciudad: id_ciudad,
                id_pais: id_pais
            };
            res.json(objetoModificado);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
direccion.delete('/:id', async (req, res) => {
    try {
        const sql = `
            UPDATE tbl_direccion
            SET activo = false, fecha_borra = current_timestamp
            WHERE id_direccion = $1
            RETURNING id_direccion, direccion, descripcion, activo, fecha_borra, correo, id_ciudad, id_pais
        `;

        const data = await db.oneOrNone(sql, [req.params.id]);
        if (data) {
            res.json(data);
        } else {
            res.status(404).json({ error: 'Registro no encontrado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});
module.exports = direccion;