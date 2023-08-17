const express = require('express');
const factura = express.Router();
const db = require('../db/conn');

factura.post('', (req, res) => {
    let params =[

        req.body.correo,
        req.body.id_direccion,
        req.body.fecha
      ];

    let sql = `INSERT INTO tbl_factura (correo, id_direccion, fecha) values ($1, $2, $3) 
                                                            RETURNING id_factura`;
     console.log(params)
                                                

    db.one(sql, params, event => event.id_rol)
        .then(data => {
            const objetoCreado = {
                correo: params[0],  
                id_direccion: params[1],
                fecha: params[2]
            }

            res.json(objetoCreado);
        })
        .catch(error => {
            res.json(error);
        });
});

factura.get('/', (req, res) => {
    let sql = "SELECT * FROM tbl_factura  where activo = true";

    db.any(sql, e => e.id)
        .then(rows => {
            res.setHeader('Content-Type', 'application/json');
            res.json(rows);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});

factura.put('/:id', (req, res) => {
    const id_factura = req.params.id_factura;
    const { correo } = req.body;
    const id_direccion = req.params.id_direccion;
    const fecha = req.params.fecha;


    const parametros = [id_factura, correo,id_direccion,fecha];

    const sql = `
      UPDATE tbl_factura 
      SET id_factura = $1
      correo =$2
      id_direccion = $3
      WHERE fecha = $4
    `;

    db.query(sql, parametros)
        .then(data => {
            const objetoModificado = {
                id_factura: id_factura,
                correo: correo,
                id_direccion :id_direccion,
                fecha : fecha
            };

            res.json(objetoModificado);
        });
});


factura.delete('/:id', async (req, res) => {
    try {
        const sql = `
            UPDATE tbl_factura
            SET id_factura = $1
            ,activo = false,
            fecha_borra = current_timestamp,
            correo =$2,
            id_direccion = $3,
            WHERE fecha =$4
            RETURNING id_factura, fecha_borra
        `;
        
        const data = await db.oneOrNone(sql, [req.params.id]);

        if (data) {
            res.json({
                id_factura: data.id_factura,
                correo : data.correo,
                id_direccion : data.id_direccion,
                fecha : data.fecha,
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







module.exports = factura;