var db = require('./db');

exports.leer = function(usuario,res){

    db.buscarPersonas(  ()=> res.json(datos)  );

    return datos;

}

