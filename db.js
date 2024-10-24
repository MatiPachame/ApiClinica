//import('mysql');
import('cors');
var mysql = require('mysql');

var conexion = mysql.createConnection({
    host: 'mysql.db.mdbgo.com',
    user: 'matipachame_matipachame',
    password: 'Matipachame2024!',
    database: 'matipachame_clinica',
    port: 3306
});


//  var pool = mysql.createPool({
//      host: 'mysql.db.mdbgo.com',
//      user: 'matipachame_matipachame',
//      password: 'ITBpachame2024!**',
//      database: 'matipachame_clinica',
//      port: 3306
//  });

const pool = mysql.createPool({
    connectionLimit: 10, // Límite de conexiones en el pool
    host: 'mysql.db.mdbgo.com',
    user: 'matipachame_matipachame',
    password: 'Matipachame2024!',
    database: 'matipachame_clinica',
    port: 3306
});

// Función para manejar conexiones y errores
function handleDisconnect() {
    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error connecting to database:', err);
            setTimeout(handleDisconnect, 2000); // Reintentar conexión después de 2 segundos
        }

        if (connection) {
            connection.release();
        }

        // Manejar errores de conexión durante la ejecución
        pool.on('error', (err) => {
            console.error('Database error:', err);
            if (err.code === 'PROTOCOL_CONNECTION_LOST') {
                handleDisconnect();
            } else {
                throw err;
            }
        });
    });
}

// Llamar a la función para iniciar la conexión y manejar la desconexión
handleDisconnect();

function conectar(){

    conexion.connect(function(err){
        if(err) console.log(err);
        else
        console.log('conexion exitosa');
    })

}


// exports.buscarPersonas= function(respuesta){
//     conectar();
//     conexion.query("SELECT * FROM usuario", function(err, resultado, filas){
//         if(err) throw err;
//         console.log(resultado);
//         respuesta(resultado);
//     });
// }



exports.buscarPersonas= function(usuario,respuesta){
    conectar();

    const sql =`SELECT u.*, m.* FROM usuario u LEFT JOIN medico m ON u.id = m.id_usuario WHERE u.usuario = ? AND u.password = ?`;
    const values = [usuario.usuario, usuario.password];
    conexion.query(sql, values, function(err, resultado, filas){
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

exports.buscarUsuariosNoAutorizados = function(){
    conectar();

    return new Promise((resolve, reject) => {
        conexion.query("SELECT u.id, u.nombre, u.apellido, u.perfil_foto, u.autorizado, (SELECT especialidad FROM medico WHERE id_usuario = u.id LIMIT 1) AS especialidad FROM usuario as u WHERE u.tipo_usuario != 1; ", (error,results) =>{
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

    const sql = "UPDATE usuario SET autorizado = ? WHERE id = ?;";
    const values = [usuario.autorizado, usuario.id];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

// exports.buscarMedicosDisponibilidad = function(){
//     conectar();

//     return new Promise((resolve, reject) => {
//         conexion.query("SELECT DISTINCT m.id_medico,u.nombre, u.apellido, u.perfil_foto,  m.especialidad, d.lunes, d.martes, d.miercoles, d.jueves, d.viernes, d.horario_desde, d.horario_hasta FROM usuario as u, medico as m, dias_atencion as d WHERE u.tipo_usuario = 2 AND u.autorizado = 1 and m.id_medico = d.id_medico AND u.id = m.id_usuario order by m.id_medico", (error,results) =>{
//             if(error){
//                 return reject;
//             }
//              resolve(results);   
//         });
//     });
   
// }

exports.buscarMedicosDisponibilidad = function() {
    conectar();

    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT 
                m.id_medico, 
                u.nombre, 
                u.apellido, 
                u.perfil_foto,  
                m.especialidad, 
                d.lunes, 
                d.martes, 
                d.miercoles, 
                d.jueves, 
                d.viernes, 
                d.horario_desde, 
                d.horario_hasta 
            FROM 
                usuario AS u, 
                medico AS m, 
                dias_atencion AS d 
            WHERE 
                u.tipo_usuario = 2 
                AND u.autorizado = 1 
                AND m.id_medico = d.id_medico 
                AND u.id = m.id_usuario 
            ORDER BY 
                m.id_medico
        `;
        
        conexion.query(query, (error, results) => {
            if (error) {
                return reject(error);
            }
            
            // Procesar los resultados para incluir los días en un array
            const processedResults = results.map(result => ({
                id_medico: result.id_medico,
                nombre: result.nombre,
                apellido: result.apellido,
                perfil_foto: result.perfil_foto,
                especialidad: result.especialidad,
                dias_atencion: [
                    result.lunes,
                    result.martes,
                    result.miercoles,
                    result.jueves,
                    result.viernes
                ],
                horario_desde: result.horario_desde,
                horario_hasta: result.horario_hasta
            }));

            resolve(processedResults);
        });
    });
};

exports.nuevoTurno = function(usuario, respuesta){
    conectar();

    const sql = "INSERT into turnos (id_usuario, id_medico, hora ,fecha ,aceptado) VALUES (?,?,?,?,?);";
    const values = [usuario.id_usuario, usuario.id_medico, usuario.hora, usuario.fecha, usuario.aceptado];

    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
};

exports.turnosTomados = function(){
    conectar();

    return new Promise((resolve, reject) => {
        conexion.query("SELECT * FROM turnos", (error,results) =>{
            if(error){
                return reject;
            }
             resolve(results);   
        });
    });
   
}

exports.turnosaTomar = function(usuario, callback){
    conectar();

    const sql = "SELECT t.*, u.nombre, u.apellido FROM turnos as t, usuario as u WHERE t.id_medico = ? AND u.id = t.id_usuario AND t.aceptado = 'Pendiente'";
    const values = [usuario.id_medico];

    conexion.query(sql, values, function (err, resultado) {
        if (err) {
            callback(err, null); // Llama al callback con el error
            return;
        }
        console.log(resultado);
        callback(null, resultado); // Llama al callback con el resultado
    });
}

exports.aceptarT = function(turno, respuesta){
    conectar();

    const sql = "UPDATE turnos SET aceptado = 'Aceptado' WHERE id_turno = ?;";
    const values = [turno.id_turno];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

exports.rechazarT = function(turno, respuesta){
    conectar();

    const sql = "UPDATE turnos SET aceptado = 'Rechazado' WHERE id_turno = ?;";
    const values = [turno.id_turno];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

exports.misT = function(usuario, respuesta){
    conectar();

    const sql = "SELECT t.*, u.nombre, u.apellido FROM turnos as t, usuario as u WHERE t.id_medico = ? AND u.id = t.id_usuario AND t.aceptado = 'Aceptado'";
    const values = [usuario.id_medico];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}
exports.finalizarT = function(turno, respuesta){
    conectar();

    const sql = "UPDATE turnos SET aceptado = 'Finalizado', val_pac = ?, comentario_pac = ? WHERE id_turno = ?;";
    const values = [turno.val_pac,turno.comentario_pac, turno.id_turno];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

exports.misTPaciente = function(usuario, respuesta){
    conectar();

    const sql = "SELECT t.*, u.nombre, u.apellido, m.especialidad FROM turnos as t, medico as m, usuario as u WHERE t.id_usuario = ? AND m.id_medico = t.id_medico AND m.id_usuario = u.id AND t.aceptado = 'Aceptado'";
    const values = [usuario.id,];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

exports.actualizarD = function(turno, respuesta){
    conectar();

    const sql = "UPDATE turnos SET diagnostico = ? WHERE id_turno = ?;";
    const values = [turno.diagnostico, turno.id_turno];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

exports.traerHistorial = function(usuario, respuesta){
    conectar();

    const sql = "SELECT t.*, u.nombre, u.apellido, m.especialidad FROM turnos as t, medico as m, usuario as u WHERE t.id_usuario = ? AND m.id_medico = t.id_medico AND m.id_usuario = u.id AND t.aceptado = 'Finalizado'";
    const values = [usuario.id,];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

exports.actualizarValoracion = function(turno, respuesta){
    conectar();

    const sql = "UPDATE turnos SET val_med = ?, comentario_med = ? WHERE id_turno = ?;";
    const values = [turno.val_med,turno.comentario_med, turno.id_turno];


    conexion.query(sql, values, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}

exports.puntuacionesMedicos = function(respuesta){
    conectar();

    const sql = "SELECT t.id_medico, u.nombre, u.apellido, m.especialidad, AVG(t.val_med) as val_med FROM usuario as u, medico as m, turnos as t WHERE t.id_medico = m.id_medico AND m.id_usuario = u.id GROUP BY t.id_medico;";

    conexion.query(sql, function (err, resultado) {
        if(err) throw err;
        console.log(resultado);
        respuesta(resultado);
    });
}




