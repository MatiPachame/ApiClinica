var db = require('./db');
var jwt = require(('jsonwebtoken'));



exports.leer = function(usuario,res){

    // db.buscarPersonas(datos => {
    //     res.json(crearJSON(validarusuario(datos,usuario)))
    // } );

    db.buscarPersonas(datos => {
        res.json(validarusuario(datos,usuario))
    } );

}




function validarusuario(datos, usuario) {
    for (i = 0; i < datos.length; i++) {
        element = datos[i];
        if (element.usuario == usuario.usuario && element.password == usuario.password)
            return element;

    };

    return null;

}

exports.buscarUsuarios = function(usuario,res){
    
    return new Promise((resolve,reject) =>{
        db.buscarUsuariosNoAutorizados((err,resultado) =>{
            if(err) {
                reject(err);
            } else {
                resolve(resultado);
            }
        })
    });

}

exports.insertar = function (usuario, res) {

    db.insertarPersona(usuario, datos => { res.json(datos) });

}

exports.borrar = function(usuario, res){

    db.borrarPersona( usuario, datos => {res.json(datos)});
    
}

function crearJSON(usuario){

    data= {data:usuario,token : jwt.sign({

        data:usuario,
        exp:Math.floor(Date.now() / 1000) + (60 * 60),


    }, "clavesupersecreta")}
    return data;        
}


