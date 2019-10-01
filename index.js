const express = require("express");
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');
var conexion=require('./src/js/conexiondb.js')


app.use(express.static('src')); //Serves resources from public folder

app.get('/', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/usuarios/administracion.html'));
});

app.get('/usuarios', function (req, res) {
	res.sendFile(path.join(__dirname+'/src/template/usuarios/usuarios.html'));
});

app.get('/usuarios/modificar', function (req, res) {
	//conexion.consulta('select * from help');
   	res.sendFile(path.join(__dirname+'/src/template/usuarios/modificarusuario.html'));
});
app.get('/usuarios/eliminar', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/usuarios/eliminarusuario.html'));
});
app.get('/usuarios/nuevo', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/usuarios/nuevousuario.html'));
});


io.on('connection', function(socket) {
    /*socket.on('new-message', function(data) {
        messages.push(data);
        io.sockets.emit('messages', messages);
    });*/
    socket.on('bancos',async function(data) {
        messages.push(data);
        io.sockets.emit('messages', messages);
    });

});

server.listen(3000, function() {
	console.log('Servidor corriendo en http://localhost:3000');
});

