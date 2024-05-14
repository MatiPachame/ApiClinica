var express = require('express')
var aplicacion = require('./aplicacion')



var app = express();
app.use(express.json());



app.get('/prueba/', (req, res) => {

    res.send("hola mundo");

});

app.post('/login/', (req,res)  => {

    var usuario = req.body;

    aplicacion.leer(usuario, res);
    if(usuario.password == usuario.usuario){
        res.json({login:'exitoso'});
    } else {
        res.json({login:'fallo'});
    }


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
