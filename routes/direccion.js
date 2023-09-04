const express = require('express');
const direccion = express.Router();
const db = require('../db/conn');
const pgp = require('pg-promise')();
direccion.post('/', (req, res) => {
    if (!req.body.direccion || !req.body.descripcion || !req.body.correo || !req.body.id_ciudad || !req.body.id_pais) {
        res.status(400).json({ error: 'Faltan campos obligatorios' });
        return;
    }
    const { direccion, descripcion, correo, id_ciudad } = req.body;
    let datos = [direccion, descripcion, correo, id_ciudad];
    let sql = `INSERT INTO tbl_direccion (direccion, descripcion, correo, id_ciudad) VALUES ($1, $2, $3, $4) RETURNING id_direccion`;
    db.one(sql, datos)
        .then(data => {
            const objetoCreado = {
                id_direccion: data.id_direccion,
                direccion: direccion,
                descripcion: descripcion,
                correo: correo,
                id_ciudad: id_ciudad,

            };
            res.json(objetoCreado);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
direccion.get('/', async (req, res) => {
    try {
        // Consulta para obtener las direcciones activas
        const direccionSql = "SELECT * FROM tbl_direccion WHERE activo = true";
        const direcciones = await db.any(direccionSql);

        // Consulta para obtener los nombres de las ciudades según sus id_ciudad
        const idCiudades = direcciones.map((direccion) => direccion.id_ciudad);
        const ciudadSql = pgp.as.format("SELECT id_ciudad, nombre FROM tbl_ciudad WHERE id_ciudad IN ($1:csv)", [idCiudades]);
        const ciudades = await db.any(ciudadSql);

        // Mapear los resultados para agregar el nombre de la ciudad a cada dirección
        const direccionesConCiudad = direcciones.map((direccion) => {
            const ciudad = ciudades.find((ciudad) => ciudad.id_ciudad === direccion.id_ciudad);
            return {
                ...direccion,
                nombre_ciudad: ciudad ? ciudad.nombre : null,
            };
        });

        res.setHeader('Content-Type', 'application/json');
        res.json(direccionesConCiudad);
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
    const parametros = [direccion, descripcion, id_ciudad, id_pais, idDireccion];
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