const express = require('express');
const factura = express.Router();
const db = require('../db/conn');
factura.post('', (req, res) => {
    let params = [
        req.body.correo,
        req.body.id_direccion,
        req.body.fecha,
        req.body.cantidadTotal,
        req.body.precioTotal
    ];
    let sql = `INSERT INTO tbl_factura (correo, id_direccion, fecha, cantidadTotal, precioTotal) values ($1, $2, $3, $4, $5) 
                                                            RETURNING id_factura`;
    console.log(params)
    db.one(sql, params, event => event.id_factura)
        .then(data => {
            const objetoCreado = {
                correo: params[0],
                id_direccion: params[1],
                fecha: params[2],
                cantidadTotal: params[3],
                precioTotal: params[4]
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

factura.get('/reporteFactura/', (req, res)=>{

    let sql = `SELECT   a.id_factura, 
                        a.correo, 
                        b.descripcion, 
                        b.direccion, 
                        b.id_ciudad, 
                        c.nombre as nombre_ciudad, 
                        c.id_pais, 
                        d.nombre as nombre_pais
                    FROM tbl_factura a 
                    inner join tbl_direccion b 
                    on a.id_direccion = b.id_direccion 
                    inner join tbl_ciudad c 
                    on  b.id_ciudad = b.id_ciudad 
                    inner join tbl_pais d 
                    on c.id_pais = d.id_pais
                    where a.activo = true`;
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
    const id_factura = req.params.id;
    const { correo, id_direccion, fecha } = req.body;
    const parametros = [correo, id_direccion, fecha, id_factura];
    const sql = `
      UPDATE tbl_factura 
      SET correo = $1, id_direccion = $2, fecha = $3
      WHERE id_factura = $4
    `;
    db.query(sql, parametros)
        .then(data => {
            const objetoModificado = {
                id_factura: id_factura,
                correo: correo,
                id_direccion: id_direccion,
                fecha: fecha
            };
            res.json(objetoModificado);
        })
        .catch(error => {
            console.error("Error updating factura:", error);
            res.status(500).json({ error: "An error occurred while updating the factura." });
        });
});
factura.delete('/:id', async (req, res) => {
    try {
        const sql = `
            UPDATE tbl_factura
            SET activo = false,
            fecha_borra = current_timestamp,
            correo = $1,
            id_direccion = $2
            WHERE id_factura = $3
            RETURNING id_factura, fecha_borra
        `;
        const { correo, id_direccion } = req.body;
        const data = await db.oneOrNone(sql, [correo, id_direccion, req.params.id]);
        if (data) {
            res.json({
                id_factura: data.id_factura,
                correo: correo,
                id_direccion: id_direccion,
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