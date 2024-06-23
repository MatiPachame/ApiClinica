var express = require('express')
var cors = require('cors')
var aplicacion = require('./aplicacion')
var jwr = require('jsonwebtoken');




var app = express();

// Configuración del límite de tamaño
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
//app.use(express.json());
app.use(cors());

//Probar el token
// app.post('/probar/', (req,res) => {


//     var token=req.headers.authorization;

//     if ((!token) || token.indexOf("Bearer ") == -1) res.sendStatus(401);
//     try {
//         var usuario =  jwt.verify(token.replace("Bearer ", ""), "clavesupersecreta");
//         res.json(JSON.stringify(usuario));
//     } catch (error) {
//          res.sendStatus(401);
//     }


// });

app.get('/prueba/', (req, res) => {

    res.send("hola mundo");

});

//POST de autorizar los usuario medicos o administradores
app.post('/get_usuarios_autorizar', (req, res) => {

    aplicacion.buscarUsuarios(req,res);

});

//POST para obtener disponibilidad de medicos
app.post('/get_disponibilidad', (req, res) => {

    aplicacion.buscarDisponibilidad(req,res);

});

//POST para login de usuarios
app.post('/login/', (req,res)  => {

    var usuario = req.body;

    aplicacion.leer(usuario, res);

    console.log(res);


});

//POST para el registro
app.post('/insertar', (req, res) => {

    var usuario = req.body;

    aplicacion.insertar(usuario, res);
    
})

app.post('/autorizacion_usuario' , (req,res) => {

    var usuario = req.body;

    aplicacion.autorizacion(usuario,res);

});


// app.post('/leer/', (req,res)  => {


//     var usuario = req.body;
//     res.json(usuario.nombre);

// });

//DELETE para borrar usuarios
app.delete('/borrar/', (req,res) => {

    var usuario = req.body;
    aplicacion.borrar(usuario, res);

})


app.listen(process.env.PORT || 3000, ()=> {

    console.log('escuchando el puerto');

});
