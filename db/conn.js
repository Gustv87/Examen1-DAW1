const pgp = require('pg-promise');

const cn = "postgrestql://postgres:@localhost:5432/tiendaonline";

const db = pgp()(cn);

db.connect()
.then( ()=> {
    console.log("Conexion Exitosa ");
})
.catch((error)=>{
    console.log(error);
});

module.exports = db;
