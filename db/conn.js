const pgp = require('pg-promise')();

const cn = 'postgres://dlujo:IyeNbUC8SfeQitrY5eiLtDvXMwCuFyb4@dpg-cjvre695mpss73aq84g0-a.oregon-postgres.render.com/dlujo';
const db = pgp(cn);

db.connect()
.then( () => {

    console.log('Conexión exitosa hacia postgresql');
}
)
.catch((error) =>  {
    console.log(`Error de conexion postgresql ${error}`);
});

module.exports = db;