const express = require('express');
const rol = express.Router();
const db = require('../db/conn');

rol.post('', (req, res) => {
    let params =[

        req.body.nombre
      ];

 

        

    let sql = `INSERT INTO tbl_rol (nombre) values ($1) 
                                                            RETURNING id_rol`;
     console.log(params)
                                                

    db.one(sql, params, event => event.id_rol)
        .then(data => {
            const objetoCreado = {
                id_rol: data,  
                nombre: params[0]
            }

            res.json(objetoCreado);
        })
        .catch(error => {
            res.json(error);
        });
});

rol.get('', (req, res) => {
    let sql = "SELECT * FROM tbl_rol where activo = true";


    db.any(sql, e => e.id_rol)
        .then(rows => {
            res.setHeader('Content-Type', 'application/json');
            res.json(rows);
        })
        .catch((error) => {
            res.status(500).json({ error: 'Error en la consulta a la base de datos' });
        });
});


rol.put('/:id_rol', (req, res) => {

    const parametros = [
        req.params.id_rol,
        req.body.nombre
      ];
    
      let sql = ` update tbl_rol 
                   set  nombre =  $2
                  
                      where id= $1`
                      ;
    
      db.result(sql, parametros, r => r.rowCount)
          .then(data => {
    
              const objetoMo = {  id_rol : req.params.id_rol, 
                                          nombre : req.body.nombre };
              
              res.json(objetoMo);
    
          })
          .catch((error) => {
              res.json(error);
          });
    
  
  
  });

rol.delete('/:id_rol', (req, res) => {
    let sql = ` update tbl_rol
                set activo = false , 
                    fecha_borra = current_timestamp 
                where id_rol = $1 `;

    db.result(sql, [req.params.id_rol] ,   r => r.rowCount)
        .then(data => {

            const objetoBorrado     = {  id_rol : req.params.id_rol, 
                                        activo : false   };
            
            res.json(objetoBorrado);

        })
        .catch((error) => {
            res.json(error);
        });

});


module.exports = rol;