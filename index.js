const express = require("express");
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');
var conexion=require('./src/js/conexiondb.js')


app.use(express.static('src')); //Serves resources from public folder

app.get('/', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/index.html'));
});


/*Bancos */
app.get('/Bancos', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/Bancos/Principal.html')); //listado
});
app.get('/Bancos/nuevo', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/Bancos/creacion.html')); //creacion
});

//Async
io.on('connection', function(socket) {
    /*socket.on('new-message', function(data) {
        messages.push(data);
        io.sockets.emit('messages', messages);
    });*/

    //Listado de bancos
    socket.on('obtener-bancos',async function(data){
        //Open Conexion
        try {
            console.log('Iniciazlizando modulo de BD');
            const result = await conexion.consulta('select cod_lote, fecha, cantidad_doc, total, estado from banco;');
            socket.emit('enviar-bancos',result.rows);
        } catch (err) {
            console.error(err);
        }
    });

});

server.listen(3000, function() {
	console.log('Servidor corriendo en http://localhost:3000');
});