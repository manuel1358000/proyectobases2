
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

app.get('/clients', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/clients-template/listClient.html'));
});

app.get('/clients/new', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/clients-template/newClient.html'));
});

io.on('connection', function(socket) {
    /*socket.on('new-message', function(data) {
        messages.push(data);

        io.sockets.emit('messages', messages);
    });*/

    socket.on('get-all-users',async function(data){
        //Open Conexion
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            const result = await database.simpleExecute('select nombres, apellidos from CLIENTE');
            //const user = result.rows[0].USER;
            //const date = result.rows[0].SYSTIMESTAMP;
            console.log(result.rows);
        } catch (err) {
            console.error(err);
        }
    });
    socket.on('create-new-user',async function(data){
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            data.dpi=parseInt(data.dpi);
            
            //var strQuery='EXECUTE PROCCREATECLIENT(\''+data.Nombres+'\',\''+data.Apellidos+'\',\'07-10-1995\','+data.DPI+',\''+data.Direccion+'\',\''+data.Usuario+'\',\''+data.Password+'\');';
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


