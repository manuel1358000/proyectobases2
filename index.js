
const express = require("express");
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');
const bodyParser = require('body-parser');
const database = require('./src/js/oracle-transactions/database.js');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('src')); //Serves resources from public folder

var currentEdit =null;



app.use(express.static('src')); //Serves resources from public folder

app.get('/', function (req, res) { 
	currentEdit=null;
    res.sendFile(path.join(__dirname+'/src/template/index.html'));
});

/*Bancos */
app.get('/bancos', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/bancos/Principal.html')); //listado
});
app.get('/bancos/nuevo', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/bancos/creacion.html')); //creacion
});
app.get('/bancos/editar/:uid',function(req,res){
    currentEdit=null;
    currentEdit=req.params.uid;
    res.sendFile(path.join(__dirname+'/src/template/bancos/editar.html'));
});

/*Agencias*/
app.get('/agencias', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/agencias/principal.html')); //listado
});
app.get('/agencias/nuevo', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/agencias/creacion.html')); //creacion
});
app.get('/agencias/editar/:uid',function(req,res){
    currentEdit=null;
    currentEdit=req.params.uid;
    res.sendFile(path.join(__dirname+'/src/template/agencias/editar.html'));
});
/*Clientes*/
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

app.get('/administracion', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/usuarios/administracion.html'));
});

app.get('/usuarios', function (req, res) {
	res.sendFile(path.join(__dirname+'/src/template/usuarios/usuarios.html'));
});
app.get('/crearusuario', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/usuarios/crearusuario.html'));
});

app.get('/solicitar_chequera', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/cheques/solicitar_chequera.html'));
});
       
io.on('connection', function(socket) {
    socket.on('eliminarusuario',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('delete from USUARIO where COD_USUARIO='+data);
            io.sockets.emit('eliminacion',result);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('bancos',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select COD_LOTE,NOMBRE from BANCO');
            io.sockets.emit('listabancos',result.rows);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('agencias',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select COD_AGENCIA,NOMBRE from AGENCIA where BANCO_COD_LOTE='+data);
            console.log(result);
            io.sockets.emit('listaagencias',result.rows);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('usuarios',async function(data){
        try {
            await database.initialize(); 
            if(data!=null){
                const result = await database.simpleExecute('select * from USUARIO where AGENCIA_COD_AGENCIA='+data);
                io.sockets.emit('listausuarios',result.rows);
            }else{
                const result = await database.simpleExecute('select * from USUARIO');
                io.sockets.emit('listausuarios',result.rows);
            }
            
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('mostraragencias',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select COD_AGENCIA,DIRECCION from AGENCIA');
            io.sockets.emit('listamostraragencias',result.rows);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('mostrarrol',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select COD_ROL,NOMBRE from ROL');
            io.sockets.emit('listamostrarrol',result.rows);
        } catch (err) {
            console.error(err);
        }
    });

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

    //nuevo banco 
    //--Por ahora con una consulta pero se tendra que arreglar luego con un proceso almacenado
    socket.on('crear-banco',async function(data){
        try {
            console.log('Inicializando agregar banco');
            await database.initialize(); 
             //query
            var strQuery ="Insert Into BANCO(Nombre, fecha, cantidad_doc,total, estado) VALUES('" + data.nombre + "', CURRENT_DATE, " + data.cantidad + "," + data.total + ",'" + data.estado + "')";
            console.log(strQuery);
            const result = await database.simpleExecute(strQuery);
            socket.emit('redirect-page',{url:'/bancos'});
        } catch (err) {
            console.error(err);
        }
    });

    //nueva agencia
    socket.on('crear-agencia',async function(data){
        try {
            console.log('Inicializando agregar agencia');
            await database.initialize(); 
            //query
            var insert = "Insert into agencia(direccion, fecha_apertura, banco_cod_lote, nombre) ";
            var values = "Values( '" + data.direccion +"','" + data.fecha + "'," + data.banco + ",'" + data.nombre  +"' ) ";
            var strQuery = insert + values;
            const result = await database.simpleExecute(strQuery);
            socket.emit('redirect-page',{url:'/agencias'});
        } catch (err) {
            console.error(err);
        }
    });
    
    //Listado de agencias
    socket.on('obtener-agencias',async function(data){
        //Open Conexion
        try {
            console.log('Iniciazlizando modulo de BD');
            await database.initialize(); 
            const result = await database.simpleExecute('select cod_agencia, direccion,fecha_apertura, banco_cod_lote,nombre from agencia');
            socket.emit('enviar-agencia',result.rows);
        }catch (err) {
            console.error(err);
        }
    });

    //Listado de bancos
    socket.on('obtener-bancos',async function(data){
        //Open Conexion
        try {
            console.log('Iniciazlizan do modulo de BD');
            await database.initialize(); 
            const result = await database.simpleExecute('select cod_lote, fecha, cantidad_doc, total, estado,nombre from banco');
            socket.emit('enviar-bancos',result.rows);
        }catch (err) {
            console.error(err);
        }
    });

    //agencia para editar
    socket.on('get-agencia',async function(data){
        if(currentEdit==null) return;
        try {
            console.log('Initializing database module');
            await database.initialize(); 

            const select = "select cod_agencia, direccion, to_char(fecha_apertura, 'DD/MM/YYYY') as fecha_apertura, banco_cod_lote, nombre ";
            const from = "from agencia where cod_agencia = "+ currentEdit

            const result = await database.simpleExecute(select + from);
            socket.emit('mandar-datos-agencia',result.rows[0]);
        } catch (err) {
            socket.emit('message-action',{message:err});
        }
    });

    //banco para editar
    socket.on('get-banco',async function(data){
        if(currentEdit==null) return;
        try {
            console.log('Iniciando edicion banco');
            await database.initialize(); 
            const select = "select cod_lote,  to_char(fecha, 'DD/MM/YYYY') as fecha, cantidad_doc, total, estado, nombre ";
            const from = "from banco where cod_lote = " + currentEdit;
            const result = await database.simpleExecute(select + from);
            console.log(result.rows[0]);
            socket.emit('mandar-datos-banco',result.rows[0]);
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

    //operacion de edicion de banco
    socket.on('editar-banco',async function(data){
        console.log('Moviendo datos banco a DB');
        await database.initialize();

        const update = "Update Banco ";
        const set = "Set Fecha = '"+ data.fecha +"', CANTIDAD_DOC = "+ data.cantidad +", TOTAL = "+ data.total + ", ESTADO = '"+ data.estado +"', NOMBRE = '"+ data.nombre +"' ";
        const where = "WHERE COD_LOTE = " + currentEdit;
        
        const result = await database.simpleExecute(update + set + where);
        socket.emit('redirect-page',{url:'/bancos'});
    });

    //operacion de edicion de agencia
    socket.on('editar-agencia',async function(data){ 
        console.log('Moviendo datos banco a DB');
        await database.initialize();

        const update = "Update Agencia ";
        const set = "Set Direccion = '"+ data.direccion +"', Fecha_Apertura = '"+ data.fecha +"', NOMBRE = '"+ data.nombre +"', BANCO_COD_LOTE = " + data.banco;
        const where = " WHERE COD_AGENCIA = " + currentEdit;

        const result = await database.simpleExecute(update + set + where);
        socket.emit('redirect-page',{url:'/agencias'});
    });

    socket.on('delete-user',async function(data){
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            data.cod_clientex=parseInt(data.cod_clientex);
            var strQuery ="BEGIN PROCDELETECLIENT(:cod_clientex); END;";
            const result = await database.simpleExecute(strQuery,data);
            socket.emit('message-action',{message:'Usuario ELIMINADO con EXITO'});
            socket.emit('redirect-page',{url:'/clients'});
            
        } catch (err) {
            socket.emit('message-action',{message:err});
            //console.error(err);
        }
    });

    //borrar banco
    socket.on('borrar-banco', async function(data){

    });

    //borrar agencia
    socket.on('borrar-agencia', async function(data){

    });

    //lista usuarios
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

    //crear nuevo usuario
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

    socket.on('crearusuario',async function(data){
        try {
            await database.initialize();
            var d=new Date(data.nacimiento.split("/").reverse().join("-"));
            var dd=d.getDate();
            var mm=d.getMonth()+1;
            var yy=d.getFullYear();
            var nacimiento2=yy+"/"+mm+"/"+dd; 
            var d=new Date(data.contratacion.split("/").reverse().join("-"));
            var dd=d.getDate();
            var mm=d.getMonth()+1;
            var yy=d.getFullYear();
            var contratacion2=yy+"/"+mm+"/"+dd; 
            var cadena="insert into USUARIO(COD_USUARIO,DPI,NOMBRES,APELLIDOS,DIRECCION,FECHA_NACIMIENTO,FECHA_CONTRATACION,ROL_COD_ROL,AGENCIA_COD_AGENCIA,VENTANILLA)values(15,"+
            +data.dpi+",'"+data.nombre+"','"+data.apellido+"','"+data.direccion+"',TO_DATE('"+nacimiento2+"','YYYY-MM-DD'),TO_DATE('"+contratacion2+"','YYYY-MM-DD'),"+data.rol+","+data.agencia+","+data.ventanilla+")";
            console.log(cadena);
            const result = await database.simpleExecute(cadena);
            
            console.log(result);
            io.sockets.emit('usuariocreado','usuariocrearo');
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('crear_chequera',async function(data){
        try {
            console.log(data);
        } catch (err) {
            console.error(err);
        }
    });
});

server.listen(3000,'127.0.0.1', function() {
	console.log('Servidor corriendo en http://localhost:3000');
});
