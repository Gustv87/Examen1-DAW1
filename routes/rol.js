const express = require('express');
const rol = express.Router();
const db = require('../db/conn');

rol.post('', (req, res) => {
    const nombre = req.body.nombre; 

    if (!nombre) {
        return res.status(400).json({ error: 'El campo nombre es requerido' });
    }

    const sql = `INSERT INTO tbl_rol (nombre) VALUES ($1) RETURNING id_rol`;

    db.one(sql, [nombre])
        .then(data => {
            const objetoCreado = {
                id_rol: data.id_rol, 
                nombre: nombre
            };
            res.json(objetoCreado);
        })
        .catch(error => {
            console.error(error); 
            res.status(500).json({ error: 'Ocurrió un error en el servidor' });
        });
});


rol.get('', async (req, res) => {
    try {
        const sql = "SELECT * FROM tbl_rol WHERE activo = true";
        const rows = await db.any(sql);
        res.setHeader('Content-Type', 'application/json');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});


rol.put('/:id_rol', async (req, res) => {
    try {
        const id_rol = req.params.id_rol;
        const nombre = req.body.nombre;
        const sql = `
            UPDATE tbl_rol 
            SET nombre = $1
            WHERE id_rol = $2`;

        await db.none(sql, [nombre, id_rol]);
        const objetoModificado = {
            id_rol: id_rol,
            nombre: nombre
        };
        res.json(objetoModificado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});


rol.delete('/:id_rol', async (req, res) => {
    try {
        const id_rol = req.params.id_rol;
        const sql = `
            UPDATE tbl_rol
            SET activo = false,
            fecha_borra = current_timestamp
            WHERE id_rol = $1`;

        await db.none(sql, [id_rol]);
        const objetoBorrado = {
            id_rol: id_rol,
            activo: false
        };
        res.json(objetoBorrado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    }
});

module.exports = rol;
