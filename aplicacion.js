var db = require('./db');
var jwt = require(('jsonwebtoken'));



exports.leer = function(usuario,res){


    db.buscarPersonas(datos => {
        res.json(validarusuario(datos,usuario))
    } );

}




// function validarusuario(datos, usuario) {
//     for (i = 0; i < datos.length; i++) {
//         element = datos[i];
//         if (element.usuario == usuario.usuario && element.password == usuario.password)
//             return element;

//     };

//     return null;

// }


//Agregando JWT
function validarusuario(datos, usuario) {
    for (i = 0; i < datos.length; i++) {
        element = datos[i];
        if (element.usuario == usuario.usuario && element.password == usuario.password){

            if (element.autorizado == 1){
                return jwt.sign({exp: Math.floor(Date.now()/1000) + (60 * 60) , data: element},"superclave");
            } else {
                return "El usuario no esta autorizado";
            }

            

        }


    };

    return null;

}

exports.buscarUsuarios = async(req,res) =>{

    try {
        const data = await db.buscarUsuariosNoAutorizados();
        res.json(data); // Enviar datos como JSON
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos' }); // Enviar error como JSON
      }

};

exports.buscarDisponibilidad = async(req,res) =>{

    try {
        const data = await db.buscarMedicosDisponibilidad();
        res.json(data); // Enviar datos como JSON
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos' }); // Enviar error como JSON
      }

};

exports.insertar = function (usuario, res) {

    db.verificarUsuarioExistente(usuario, function (err, existe) {
        if (err) {
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        if (existe) {
            return res.status(400).json({ error: 'Usuario con el mismo usuario y password ya existe' });
        }

        db.insertarPersona(usuario, datos => {
            res.json(datos);
        });
    });
}

exports.autorizacion = function(usuario,res){

    db.AutorizacionUsuario(usuario, datos => {
        res.json(datos);
    });

}

exports.insertarTurno = function (usuario, res) {

        db.nuevoTurno(usuario, datos => {
            res.json(datos);
        });
}

exports.buscarTurnos = async(req,res) =>{

    try {
        const data = await db.turnosTomados();
        res.json(data); // Enviar datos como JSON
      } catch (error) {
        res.status(500).json({ error: 'Error al obtener los datos' }); // Enviar error como JSON
      }

};

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


