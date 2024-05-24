var express = require('express')
var cors = require('cors')
var aplicacion = require('./aplicacion')




var app = express();
app.use(express.json());
app.use(cors());





app.get('/prueba/', (req, res) => {

    res.send("hola mundo");

});

app.get('/autorizar_medicos', (req, res) => {



    res.send(aplicacion.autorizar());

});

app.post('/login/', (req,res)  => {

    var usuario = req.body;

    aplicacion.leer(usuario, res);
    // if(usuario.usuario == res.usuario){
    //     res.json({login:'exitoso'});
    // } else {
    //     res.json({login:'fallo'});
    // }

    console.log(res);


});

app.post('/insertar', (req, res) => {

    var usuario = req.body;

    

    aplicacion.insertar(usuario, res);

    

})

app.post('/leer/', (req,res)  => {


    var usuario = req.body;
    res.json(usuario.nombre);

});

app.delete('/borrar/', (req,res) => {

    var usuario = req.body;
    aplicacion.borrar(usuario, res);

})


app.listen(process.env.PORT || 3000, ()=> {

    console.log('escuchando el puerto');

});
