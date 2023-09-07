const express = require('express');
const login = express.Router();
const db = require('../db/conn');

login.post('/', (req, res) => {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
        res.status(400).json({ error: 'Los campos deben ser cadenas de caracteres' });
        return;
    }

    const sql = `
        SELECT * FROM tbl_login
        WHERE email = $1 AND password = $2
    `;
    const params = [email, password];

    db.oneOrNone(sql, params)
        .then(user => {
            if (user) {
                // Autenticación exitosa, puedes generar un token de autenticación si es necesario
                res.json({ success: true, message: 'Inicio de sesión exitoso' });
            } else {
                res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});

login.get('/', (req, res) => {
    const sql = `SELECT email FROM tbl_login`;

    db.any(sql)
        .then(users => {
            res.json(users);
        })
        .catch(error => {
            console.error(error);
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});

module.exports = login;
