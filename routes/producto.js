const express =  require('express');//const que es nuestra libreria de express
const producto = express.Router();
const db = require('../db/conn');//conexion a la base de datos

producto.post('', (req, res) => {

    let datos = [

        req.body.nombre,
        req.body.precio

    ];

    let sql = ` insert into tbl_producto
                (nombre, precio)
                values
                ($1, $2) returning id_producto`;

    db.one(sql, datos, event => event.id_producto)
        .then(data => {

            const objetoCreado = {

                id_producto: data,
                nombre: datos[0],
                precio: datos[1]

            }

            res.json(objetoCreado);

        })
        .catch((error) => {

            res.json(error);

        });
});

producto.get('',(req, res)=>{

    let sql ="select * from tbl_producto where activo = true";

    db.any(sql , e => e.id_producto)
    .then (rows =>{
        res.json(rows);
    })
    .catch((error)=>{
        res.json(error);
    })
})

producto.put('/:id_producto', (req,res)=>{

    const parametros = [
        req.body.nombre,
        req.body.precio,
        req.params.id_producto
    ];

    let sql = `update tbl_producto
                set nombre = $1,
                    precio = $2
                where id_producto = $3`;

    db.result(sql,parametros,r => r.rowCount) 
    .then(data=>{
        const objetoModificado = {  id_producto: req.params.id_producto,
                                    nombre: req.body.nombre, 
                                    precio: req.body.precio}
        res.json(objetoModificado);
    })
    .catch((error)=>{
        res.json(error);
    })
});


producto.delete('/:id_producto', (req,res)=>{



    let sql = `update tbl_producto
                set activo = false,
                    fecha_borra = current_timestamp
                where id_producto = $1
                RETURNING id_producto, fecha_borra`;

    db.result(sql,[req.params.id_producto],r => r.rowCount) 
    .then(data=>{
        const objetoBorrado = {  id_producto: req.params.id_producto,
                                     
                                    activo : false};
        res.json(objetoBorrado);
    })
    .catch((error)=>{
        res.json(error);
    })
})

module.exports = producto;