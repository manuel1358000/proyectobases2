
const express = require("express");
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');
var conexion=require('./src/js/conexiondb.js')
const database = require('./src/js/oracle-transactions/database.js');



app.use(express.static('src')); //Serves resources from public folder

app.get('/', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/index.html'));
});

/*Bancos */
app.get('/bancos', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/Bancos/HTML/Principal.html')); //listado
});
app.get('/bancos/nuevo', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/Bancos/HTML/creacion.html')); //creacion
});

/*Agencias*/
app.get('/agencias', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/Agencias/HTML/principal.html')); //listado
});
app.get('/agencias/nuevo', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/Agencias/HTML/creacion.html')); //creacion
});

/*Clientes*/
app.get('/clients', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/clients-template/listClient.html'));
});

app.get('/clients/new', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/clients-template/newClient.html'));
});


//Funciones Aysncronicas
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
            await database.initialize(); 
            const result = await database.simpleExecute('select cod_lote, fecha, cantidad_doc, total, estado from banco');
            socket.emit('enviar-bancos',result.rows);
        }catch (err) {
            console.error(err);
        }
    });

    //Listado de agencias
    socket.on('obtener-agencias',async function(data){
        //Open Conexion
        try {
            console.log('Iniciazlizando modulo de BD');
            await database.initialize(); 
            const result = await database.simpleExecute('select cod_agencia, direccion, fecha_apertura, banco_cod_lote from agencia;');
            socket.emit('enviar-agencia',result.rows);
        }catch (err) {
            console.error(err);
        }
    });

    //borrar usuario
    socket.on('delete-user',async function(data){
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            data.cod_clientex=parseInt(data.cod_clientex);
            var strQuery ="BEGIN PROCDELETECLIENT(:cod_clientex); END;";
            const result = await database.simpleExecute(strQuery,data);
        } catch (err) {
            console.error(err);
        }
    });

    //lista usuarios
    socket.on('get-all-users',async function(data){
        //Open Conexion
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            const result = await database.simpleExecute('select cod_cliente,nombres, apellidos,usuario,direccion,fecha_nacimiento from CLIENTE');
            socket.emit('send_receive-all-users',result.rows);
        } catch (err) {
            console.error(err);
        }
    });

    //crear nuevo usuario
    socket.on('create-new-user',async function(data){
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            data.dpi=parseInt(data.dpi);
            
            var strQuery ="BEGIN PROCCREATECLIENT(:nombres,:apellidos,:fecha_nac,:dpi,:direccion,:usuario,:password); END;";
            console.log(strQuery);
            const result = await database.simpleExecute(strQuery,data);
        } catch (err) {
            console.error(err);
        }
        //Close Conexion
        /*try {
            console.log('Closing database module');
            await database.close(); 
        } catch (err) {
        console.log('Encountered error', err);
        }*/
    });
});

server.listen(3000, function() {
	console.log('Servidor corriendo en http://localhost:3000');
});

