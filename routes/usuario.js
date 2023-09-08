const express = require('express');
const usuario = express.Router();
const db = require('../db/conn');

usuario.post('', (req, res) => {
    let correo = req.body.correo;
    let nombre_usuario = req.body.nombre_usuario;
    let password = req.body.password;
    let id_rol = 2;
  
    // Verificar si el correo electrónico ya existe en la base de datos
    let sqlVerificarCorreo = `SELECT correo FROM tbl_usuario WHERE correo = $1`;
    db.one(sqlVerificarCorreo, [correo])
      .then(() => {
        // El correo electrónico ya existe, devolver un error
        res.status(400).json({ error: 'El correo electrónico ya está registrado' });
      })
      .catch(() => {
        // El correo electrónico no existe, realizar la inserción
        let sqlInsertarUsuario = `INSERT INTO tbl_usuario (correo, nombre, password, id_rol) VALUES ($1, $2, $3, $4) RETURNING correo, id_rol`;
        let params = [correo, nombre_usuario, password, id_rol];
  
        db.one(sqlInsertarUsuario, params)
          .then(data => {
            const objetoCreado = {
              correo: data.correo,
              nombre_usuario: nombre_usuario,
              password: password,
              id_rol: data.id_rol
            };
            res.json(objetoCreado);
          })
          .catch((error) => {
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
          });
      });
  });
usuario.get('', (req, res) => {
    let sql = `SELECT tbl_usuario.correo, tbl_usuario.nombre AS nombre_usuario, tbl_rol.nombre AS nombre_rol
    FROM tbl_usuario
    INNER JOIN tbl_rol ON tbl_usuario.id_rol = tbl_rol.id_rol;
    `;
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