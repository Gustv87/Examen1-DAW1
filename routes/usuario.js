const express = require('express');
const usuario = express.Router();
const db = require('../db/conn');

usuario.post('', (req, res) => {
    let params = [
        req.body.correo,
        req.body.nombre,
        req.body.id_rol
    ];
    let sql = `INSERT INTO tbl_usuario (correo, nombre, id_rol) values ($1, $2, $3) 
                                                            RETURNING correo`;
    console.log(params)
    db.one(sql, params, event => event.id_rol)
        .then(data => {
            const objetoCreado = {
                correo: params[0],
                nombre: params[1],
                id_rol: params[2]
            }
            res.json(objetoCreado);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
usuario.get('', (req, res) => {
    let sql = "SELECT * FROM tbl_usuario where activo = true";
    db.any(sql, e => e.correo)
        .then(rows => {
            res.setHeader('Content-Type', 'application/json');
            res.json(rows);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
usuario.put('/:correo', (req, res) => {
    const parametros = [
        req.params.correo,
        req.body.nombre
    ];
    let sql = ` update tbl_usuario 
                   set  nombre =  $2
                  
                      where correo= $1`
        ;
    db.result(sql, parametros, r => r.rowCount)
        .then(data => {
            const objetoMo = {
                usuario: req.params.correo,
                nombre: req.body.nombre
            };
            res.json(objetoMo);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
usuario.delete('/:correo', (req, res) => {
    let sql = ` update tbl_usuario
                set activo = false , 
                    fecha_borra = current_timestamp 
                where correo = $1 `;
    db.result(sql, [req.params.correo], r => r.rowCount)
        .then(data => {
            const objetoBorrado = {
                correo: req.params.correo,
                activo: false
            };
            res.json(objetoBorrado);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});
module.exports = usuario;