import('mysql');

var conexion = mysql.createConnection({
    host: 'mysql.db.mdbgo.com',
    user: '	matipachame_matipachame',
    password: 'ITBpachame2024!**',
    database: '	matipachame_clinica',
});

function conectar(){

    conexion.connect(function(err){
        if(err) console.log(err);
        elseñ
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

