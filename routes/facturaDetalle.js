const express = require('express');//const que es nuestra libreria de express
const facturaDetalle = express.Router();
const db = require('../db/conn');//conexion a la base de datos
facturaDetalle.post('', (req, res) => {
    let datos = [
        req.body.id_factura,
        req.body.cantidad,
        req.body.id_producto
    ];
    let sql = ` insert into tbl_factura_detalle
                (id_factura, cantidad, id_producto)
                values
                ($1, $2, $3) returning id_detalle`;
    db.one(sql, datos, event => event.id_producto)
        .then(data => {
            const objetoCreado = {
                id_detalle: data,
                id_factura: datos[0],
                cantidad: datos[1],
                id_producto: datos[2]
            }
            res.json(objetoCreado);
        })
        .catch((error) => {
            res.json(error);
        });
});
facturaDetalle.get('/:id_factura', (req, res) => {
    let sql = `
            select d.id_detalle, f.correo, p.nombre, d.cantidad, f.id_factura
            from tbl_factura_detalle as d
            inner join tbl_factura as f on d.id_factura = f.id_factura
            inner join tbl_producto as p on d.id_producto = p.id_producto
            where d.activo = true and f.id_factura=$1`;
    db.any(sql, req.params.id_factura)
        .then(rows => {
            res.json(rows);
        })
        .catch((error) => {
            res.json(error);
        })
})

facturaDetalle.put('/:id_detalle', (req, res) => {
    const parametros = [
        req.body.id_factura,
        req.body.cantidad,
        req.body.id_producto,
        req.params.id_detalle
    ];
    let sql = `update tbl_factura_detalle
                set id_factura = $1,
                    cantidad = $2,
                    id_producto = $3
                where id_detalle = $4`;
    db.result(sql, parametros, r => r.rowCount)
        .then(data => {
            const objetoModificado = {
                id_detalle: req.params.id_detalle,
                id_factura: req.body.id_factura,
                cantidad: req.body.cantidad,
                id_producto: req.body.id_producto
            }
            res.json(objetoModificado);
        })
        .catch((error) => {
            res.json(error);
        })
});


facturaDetalle.delete('/:id_detalle', (req, res) => {
    let sql = `update tbl_factura_detalle
                set activo = false,
                    fecha_borra = current_timestamp
                where id_detalle = $1
                RETURNING id_detalle, fecha_borra`;
    db.result(sql, [req.params.id_detalle], r => r.rowCount)
        .then(data => {
            const objetoBorrado = {
                id_detalle: req.params.id_detalle,
                activo: false
            };
            res.json(objetoBorrado);
        })
        .catch((error) => {
            res.json(error);
        })
})
module.exports = facturaDetalle;