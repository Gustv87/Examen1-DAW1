const express = require('express');
const direccion = express.Router();
const db = require('../db/conn');
const pgp = require('pg-promise')();

direccion.post('/', async (req, res) => {
    if (!req.body.direccion || !req.body.descripcion || !req.body.correo || !req.body.id_ciudad) {
        res.status(400).json({ error: 'Faltan campos obligatorios' });
        return;
    }
    const { direccion, descripcion, correo, id_ciudad } = req.body;
    let datos = [direccion, descripcion, correo, id_ciudad];
    let sql = `INSERT INTO tbl_direccion (direccion, descripcion, correo, id_ciudad) VALUES ($1, $2, $3, $4) RETURNING id_direccion`;

    try {
        const data = await db.one(sql, datos);

        // Ahora, obtén el nombre de la ciudad correspondiente
        const ciudadSql = 'SELECT nombre FROM tbl_ciudad WHERE id_ciudad = $1';
        const ciudadData = await db.one(ciudadSql, id_ciudad);

        const objetoCreado = {
            id_direccion: data.id_direccion,
            direccion: direccion,
            descripcion: descripcion,
            correo: correo,
            id_ciudad: ciudadData.nombre, // Mantenemos el nombre de campo 'id_ciudad'
        };
        
        res.json(objetoCreado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

direccion.get('/', async (req, res) => {
    try {
        // Consulta para obtener las direcciones activas
        const direccionSql = "SELECT d.*, c.nombre AS nombre_ciudad FROM tbl_direccion d INNER JOIN tbl_ciudad c ON d.id_ciudad = c.id_ciudad WHERE d.activo = true";
        const direcciones = await db.any(direccionSql);

        res.setHeader('Content-Type', 'application/json');
        res.json(direcciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

direccion.put('/:id', (req, res) => {
    const idDireccion = req.params.id;
    const { direccion, descripcion, id_ciudad } = req.body;
    if (!direccion || !descripcion || !id_ciudad) {
        res.status(400).json({ error: 'Faltan campos obligatorios' });
        return;
    }
    const parametros = [direccion, descripcion, id_ciudad, idDireccion];
    const sql = `
      UPDATE tbl_direccion 
      SET direccion = $1, descripcion = $2, id_ciudad = $3
      WHERE id_direccion = $4
    `;
    db.query(sql, parametros)
        .then(data => {
            const objetoModificado = {
                id_direccion: idDireccion,
                direccion: direccion,
                descripcion: descripcion,
                id_ciudad: id_ciudad,

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
            RETURNING id_direccion, direccion, descripcion, activo, fecha_borra, correo, id_ciudad
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