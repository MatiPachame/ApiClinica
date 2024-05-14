var db = require('./db');

exports.leer = function(usuario,res){

    db.buscarPersonas(  ()=> res.json(datos)  );

    return datos;

}

function validarusuario(datos, usuario) {
    for (i = 0; i < datos.length; i++) {
        element = datos[i];
        if (element.Usuario == usuario.usuario && element.Password == usuario.password)
            return element;

    };

    return null;

}

exports.insertar = function (usuario, res) {

    db.insertarPersona(usuario, datos => { res.json(datos) });

}

exports.borrar = function(usuario, res){

    db.borrarPersona( usuario, datos => {res.json(datos)});
    
}

