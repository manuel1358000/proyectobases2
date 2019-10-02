
const express = require("express");
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');
var conexion=require('./src/js/conexiondb.js')
const database = require('./src/js/oracle-transactions/database.js');

var currentEdit =null;

app.use(express.static('src')); //Serves resources from public folder

app.use(express.static('src')); //Serves resources from public folder

app.get('/', function (req, res) {
	currentEdit=null;
    res.sendFile(path.join(__dirname+'/src/template/index.html'));
});

app.get('/clients', function (req, res) {
	currentEdit=null;
    res.sendFile(path.join(__dirname+'/src/template/clients-template/listClient.html'));
});

app.get('/clients/new', function (req, res) {
	currentEdit=null;
    res.sendFile(path.join(__dirname+'/src/template/clients-template/newClient.html'));
});

app.get('/clients/:uid',function(req,res){
    currentEdit=null;
    currentEdit=req.params.uid;
    res.sendFile(path.join(__dirname+'/src/template/clients-template/editClient.html'));
});

io.on('connection', function(socket) {
    socket.on('get-user',async function(data){
        if(currentEdit==null) return;
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            const result = await database.simpleExecute('select cod_cliente,nombres,apellidos,dpi,usuario,direccion,to_char(fecha_nacimiento, \'DD-MM-YYYY\') as fecha_nacimiento,password from CLIENTE where cod_cliente='+currentEdit);
            socket.emit('send_receive-user',result.rows[0]);
        } catch (err) {
            socket.emit('message-action',{message:err});
        }
    });

    socket.on('edit-user',async function(data){
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            data['cod_clientex']=parseInt(currentEdit);
            data.dpi=parseInt(data.dpi);
            console.log(data);
            var strQuery ="BEGIN PROCEDITCLIENT(:cod_clientex,:nombres,:apellidos,:fecha_nac,:dpi,:direccion,:usuario,:password); END;";
            const result = await database.simpleExecute(strQuery,data);
            console.log(result);
            socket.emit('message-action',{message:'Usuario EDITADO con EXITO'});
        } catch (err) {
            console.log(err);
            socket.emit('message-action',{message:err});
            //console.error(err);
        }
    });
    socket.on('delete-user',async function(data){
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            data.cod_clientex=parseInt(data.cod_clientex);
            var strQuery ="BEGIN PROCDELETECLIENT(:cod_clientex); END;";
            const result = await database.simpleExecute(strQuery,data);
            socket.emit('message-action',{message:'Usuario ELIMINADO con EXITO'});
        } catch (err) {
            socket.emit('message-action',{message:err});
            //console.error(err);
        }
    });
    socket.on('get-all-users',async function(data){
        //Open Conexion
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            const result = await database.simpleExecute('select cod_cliente,nombres, apellidos,usuario,direccion,to_char(fecha_nacimiento, \'DD-MM-YYYY\') as fecha_nacimiento from CLIENTE');
            socket.emit('send_receive-all-users',result.rows);
        } catch (err) {
            socket.emit('message-action',{message:err});
            //console.error(err);
        }
    });

    socket.on('create-new-user',async function(data){
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            data.dpi=parseInt(data.dpi);
            
            var strQuery ="BEGIN PROCCREATECLIENT(:nombres,:apellidos,:fecha_nac,:dpi,:direccion,:usuario,:password); END;";
            console.log(strQuery);
            const result = await database.simpleExecute(strQuery,data);
            console.log(result);
            socket.emit('message-action',{message:'Usuario CREADO con EXITO'});
            socket.emit('redirect-page',{url:'/clients'});
        } catch (err) {
            socket.emit('message-action',{message:err});
            //console.error(err);
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
