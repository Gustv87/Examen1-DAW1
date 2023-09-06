const express = require('express');
const fotos = express.Router();
const db = require('../db/conn');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({storage});

fotos.post('/',  upload.single('archivo')  , (req, res)=>{


    if ( !req.file ){
        return res.status(500).json( {error:'Debes enviar un archivo'} );
    }

    const valores = [

        req.file.originalname, 
        req.file.buffer, 
        req.file.mimetype

    ];

    let sql = ` insert into tbl_fotos
                ( nombre, archivo, mime_type )
                values 
                ( $1, $2 ,$3 ) returning id , nombre, mime_type `;

    db.one(sql , valores)
        .then( data =>{

            let objetoCreado = { 
                                id : data.id, 
                                nombre : data.nombre, 
                                tipo_archivo : data.mime_type
                            };
            res.json(objetoCreado);

        })
        .catch( error=>{
            res.status(500).json(error);
        })

});

fotos.get('/', (req, res)=>{

    let sql = ` select id , nombre, mime_type, encode(archivo, 'base64') archivo from tbl_prueba_fotos `;

    db.any(sql)
    .then( rows=>{

        res.json(rows);

    })
    .catch( error=>{

        res.status(500).json(error);

    } )

});

fotos.put('/:id',  upload.single('archivo')  , (req, res)=>{


    if ( !req.file ){
        return res.status(500).json( {error:'Debes enviar un archivo'} );
    }

    const valores = [

        req.file.originalname, 
        req.file.buffer, 
        req.file.mimetype, 
        req.params.id

    ];

    let sql = ` update tbl_fotos 
                set nombre = $1, 
                    archivo = $2, 
                    mime_type = $3 
                where id =  $4 
                returning id , nombre, mime_type `;

    db.result(sql , valores)
        .then( data =>{
            
            res.json(data.rows);

        })
        .catch( error=>{
            res.status(500).json(error);
        })

});


module.exports = fotos;