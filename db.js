//import('mysql');
import('cors');
var mysql = require('mysql');

var conexion = mysql.createConnection({
    host: 'mysql.db.mdbgo.com',
    user: 'matipachame_matipachame',
    password: 'ITBpachame2024!**',
    database: 'matipachame_clinica',
    port: 3306
});


var pool = mysql.createPool({
    host: 'mysql.db.mdbgo.com',
    user: 'matipachame_matipachame',
    password: 'ITBpachame2024!**',
    database: 'matipachame_clinica',
    port: 3306
});

function conectar(){

    conexion.connect(function(err){
        if(err) console.log(err);
        else
        console.log('conexion exitosa');
    })

}


exports.buscarPersonas= function(respuesta){
    conectar();
    conexion.query("SELECT * FROM usuario", function(err, resultado, filas){
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

exports.buscarUsuariosNoAutorizados = function(){
    conectar();

    return new Promise((resolve, reject) => {
        conexion.query("SELECT * FROM usuario WHERE tipo_usuario != 1", (error,results) =>{
            if(error){
                return reject;
            }
             resolve(results);   
        });
    });
   
}

exports.verificarUsuarioExistente = function (usuario, callback) {
        conectar();

        const sql = "SELECT * FROM usuario WHERE usuario = ? AND password = ? OR mail = ?";
        const values = [usuario.usuario, usuario.password, usuario.mail];

        conexion.query(sql, values, function (err, results) {

            if (err) {
                return callback(err);
            }

            if (results.length > 0) {
                return callback(null, true); // Usuario y password ya existen
            } else {
                return callback(null, false); // Usuario y password no existen
            }
        });  
};

exports.insertarPersona = function(usuario, retornar){
    pool.getConnection(function (err, conexion) {
        if (err) {
            return retornar(err);
        }

        
        conexion.beginTransaction(function (err) {
            if (err) {
                conexion.release();
                return retornar(err);
            }

            var sql = "INSERT INTO usuario (nombre, apellido, mail, fec_nac, usuario, password, tipo_usuario ,perfil_foto ,autorizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            var values = [usuario.nombre, usuario.apellido, usuario.mail, usuario.nacimiento, usuario.usuario, usuario.password, usuario.tipo_usuario,usuario.perfil_foto, usuario.autorizado];

            conexion.query(sql, values, function (err, resultado) {
                if (err) {
                    return conexion.rollback(function () {
                        conexion.release();
                        return retornar(err);
                    });
                }

                const usuarioId = resultado.insertId;

                if (usuario.tipo_usuario == 2) { //Si es medico, se guardan los datos extras
                    var sqlMedico = "INSERT INTO medico (id_usuario, especialidad, especialidad_foto) VALUES (?, ?, ?)";
                    var valuesMedico = [usuarioId, usuario.especialidad, usuario.especialidad_foto];

                    conexion.query(sqlMedico, valuesMedico, function (err, resultadoMedico) {
                        if (err) {
                            return conexion.rollback(function () {
                                conexion.release();
                                return retornar(err);
                            });
                        }

                        // Insertar días de atención y horarios en dias_atencion_medicos
                        var diasAtencionBooleans = usuario.dias_atencion; // Array de booleans
                        var horariosDesde = usuario.horario_desde;
                        var horariosHasta = usuario.horario_hasta;

                        var sqlDiasAtencion = "INSERT INTO dias_atencion(id_medico, lunes, martes, miercoles, jueves, viernes, horario_desde, horario_hasta) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                        var valuesDiasAtencion = [
                            resultadoMedico.insertId,
                            diasAtencionBooleans[0], // lunes
                            diasAtencionBooleans[1], // martes
                            diasAtencionBooleans[2], // miercoles
                            diasAtencionBooleans[3], // jueves
                            diasAtencionBooleans[4], // viernes
                            horariosDesde,
                            horariosHasta
                        ];

                        conexion.query(sqlDiasAtencion, valuesDiasAtencion, function (err, resultadoDiasAtencion) {
                            if (err) {
                                return conexion.rollback(function () {
                                    conexion.release();
                                    return retornar(err);
                                });
                            }

                            conexion.commit(function (err) {
                                if (err) {
                                    return conexion.rollback(function () {
                                        conexion.release();
                                        return retornar(err);
                                    });
                                }

                                console.log('Inserción exitosa en todas las tablas');
                                conexion.release();
                                return retornar(null, resultadoMedico);
                            });
                        });
                    });
                } else {
                    // Si no es un médico, confirmamos la transacción del usuario normal
                    conexion.commit(function (err) {
                        if (err) {
                            return conexion.rollback(function () {
                                conexion.release();
                                return retornar(err);
                            });
                        }

                        console.log('Inserción exitosa en la tabla usuario');
                        conexion.release();
                        return retornar(null, resultado);
                    });
                }
            });
        });
    });
}


exports.AutorizacionUsuario = function(usuario, respuesta){
    conectar();

    const sql = "UPDATE usuario SET autorizado = ? WHERE usuario = ? AND password = ?;";
    const values = [usuario.autorizado, usuario.usuario, usuario.password];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

