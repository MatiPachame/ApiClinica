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

        const sql = "SELECT * FROM usuario WHERE usuario = ? AND password = ?";
        const values = [usuario.usuario, usuario.password];

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

            var sql = "INSERT INTO usuario (nombre, apellido, mail, fec_nac, usuario, password, tipo_usuario, autorizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            var values = [usuario.nombre, usuario.apellido, usuario.mail, usuario.nacimiento, usuario.usuario, usuario.password, usuario.tipo_usuario, usuario.autorizado];

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
                        var diasAtencion = usuario.dias_atencion;
                        var horariosDesde = usuario.horario_desde;
                        var horariosHasta = usuario.horario_hasta;

                        if (Array.isArray(diasAtencion) && diasAtencion.length > 0) {
                            var sqlDiasAtencion = "INSERT INTO dias_atencion_medicos (id_medico, dia_atencion, horario_desde, horario_hasta) VALUES ";
                            var placeholders = diasAtencion.map(() => "(?, ?, ?, ?)").join(',');
                            var valuesDiasAtencion = [];

                            // Crear los valores a insertar para cada día de atención y horario
                            diasAtencion.forEach((dia) => {
                                valuesDiasAtencion.push(resultadoMedico.insertId, dia, horariosDesde, horariosHasta);
                            });

                            sqlDiasAtencion += placeholders;

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
                        } else {
                            // Si no hay días de atención, solo confirmamos la transacción del médico
                            conexion.commit(function (err) {
                                if (err) {
                                    return conexion.rollback(function () {
                                        conexion.release();
                                        return retornar(err);
                                    });
                                }

                                console.log('Inserción exitosa en la tabla medico');
                                conexion.release();
                                return retornar(null, resultadoMedico);
                            });
                        }
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

exports.AutorizacionUsuario = function(respuesta){
    conectar();

    const sql = "UPDATE usuario SET autorizado = ? WHERE usuario = ? AND password = ?;";
    const values = [usuario.autorizado, usuario.usuario, usuario.password];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

