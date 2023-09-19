const express = require('express');
const usuario = express.Router();
const db = require('../db/conn');

usuario.post('/', (req, res) => {
  const correo = req.body.correo;
  const password = req.body.password;

  // Verificar si el usuario existe en la base de datos
  let sql = `SELECT correo, nombre, id_rol FROM tbl_usuario WHERE correo = $1 AND password = $2`;
  db.oneOrNone(sql, [correo, password])
    .then((data) => {
      if (data) {
        // El usuario existe, se puede iniciar sesión
        res.json({ mensaje: 'Inicio de sesión exitoso', user: data });
      } else {
        // El usuario no existe o las credenciales son incorrectas
        res.status(401).json({ error: 'Credenciales inválidas' });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: 'Error en la consulta a la base de datos' });
    });
});

module.exports = usuario;
