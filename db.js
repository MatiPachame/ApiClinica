//import('mysql');
var mysql = require('mysql');

var conexion = mysql.createConnection({
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

exports.insertarPersona = function(usuario, retornar){
    conectar();

    var sql = "INSERT into usuario(nombre,apellido,fec_nac,usuario,password,tipo_usuario)";
    sql= sql + " values ('" + usuario.nombre + "',";
    sql= sql + "'" + usuario.apellido + "',";
    sql= sql + "'" + usuario.nacimiento + "',";
    sql= sql + "'" + usuario.usuario + "',";
    sql= sql + "'" + usuario.password + "',";
    sql= sql + "'" + usuario.tipo_usuario + "')";
    
    conexion.query(sql,
        function(err, resultado, filas){
           if(err) throw err;
           console.log(resultado);
           
           retornar(resultado);
   
       } );


}

exports.borrarPersona = function(usuario, retornar){
    conectar();
    var sql = "DELETE from usuario WHERE usuario = ";
    sql = sql + "'" + usuario.usuario + "')";

    conexion.query(sql,
        function(err, resultado, filas){
           if(err) throw err;
           console.log(resultado);
           
           retornar(resultado);
   
       } );


}

