
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

var currentEdit ={};




app.use(express.static('src')); //Serves resources from public folder

app.get('/', function (req, res) {

    res.sendFile(path.join(__dirname+'/src/template/index.html'));
});

/*Bancos */
app.get('/bancos', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/bancos/Principal.html')); //listado
});
app.get('/bancos/nuevo', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/bancos/creacion.html')); //creacion
});

/*Agencias*/
app.get('/agencias', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/agencias/principal.html')); //listado
});
app.get('/agencias/nuevo', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/agencias/creacion.html')); //creacion
});
/*Clientes*/
app.get('/clients', function (req, res) {
	
    res.sendFile(path.join(__dirname+'/src/template/clients-template/listClient.html'));
});

app.get('/clients/new', function (req, res) {
	
    res.sendFile(path.join(__dirname+'/src/template/clients-template/newClient.html'));
});

app.get('/clients/:uid',function(req,res){
    
    currentEdit['client-id']=req.params.uid;
    res.sendFile(path.join(__dirname+'/src/template/clients-template/editClient.html'));
});

app.get('/administracion', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/usuarios/administracion.html'));
});

app.get('/usuarios', function (req, res) {
	res.sendFile(path.join(__dirname+'/src/template/usuarios/usuarios.html'));
});
app.get('/roles', function (req, res) {
	res.sendFile(path.join(__dirname+'/src/template/roles/roles.html'));
});
app.get('/crearusuario', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/usuarios/crearusuario.html'));
});


app.get('/solicitar_chequera', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/cheques/solicitar_chequera.html'));
});

app.get('/clients/:uid/accounts',function(req,res){
    currentEdit['client-id']=req.params.uid;
    console.log(currentEdit);
    res.sendFile(path.join(__dirname+'/src/template/clients-template/accounts-template/listAccount.html'));
});

app.get('/clients/:uid/accounts/new', function (req, res) {
    currentEdit['client-id']=req.params.uid;
    console.log(currentEdit);
    res.sendFile(path.join(__dirname+'/src/template/clients-template/accounts-template/newAccount.html'));
});

app.get('/clients/:uid/accounts/:uidc',function(req,res){
    currentEdit['client-id']=req.params.uid;
    currentEdit['account-id']=req.params.uidc;
    console.log(currentEdit);
    res.sendFile(path.join(__dirname+'/src/template/clients-template/accounts-template/editAccount.html'));
});
   
app.get('/sign-in',function(req,res){
    res.sendFile(path.join(__dirname+'/src/template/sign-in-sign-up-templates/sign-in-template/sign-in-form.html'));
});

app.get('/sign-up',function(req,res){
    res.sendFile(path.join(__dirname+'/src/template/sign-in-sign-up-templates/sign-up-template/sign-up-form.html'));
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
        if(currentEdit['client-id']==null) return;
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            const result = await database.simpleExecute('select cod_cliente,nombres,apellidos,dpi,usuario,direccion,to_char(fecha_nacimiento, \'DD-MM-YYYY\') as fecha_nacimiento,password from CLIENTE where cod_cliente='+currentEdit['client-id']);
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
            //casteos
            /*data.lotes=parseInt(data.lotes);
            data.cantidad=parseInt(data.cantidad);
            data.total=parseInt(data.total);*/

            //query
            var strQuery ="Insert Into BANCO VALUES(" + data.lotes + ", CURRENT_DATE, " + data.cantidad + "," + data.total + ",'" + data.estado + "')";
            console.log(strQuery);
            const result = await database.simpleExecute(strQuery);
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
    socket.on('edit-user',async function(data){
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            data['cod_clientex']=parseInt(currentEdit['client-id']);
            data.dpix=parseInt(data.dpix);
            console.log(data);
            var strQuery ="BEGIN PROCEDITCLIENT(:cod_clientex,:nombresx,:apellidosx,:fecha_nacx,:dpix,:direccionx,:usuariox,:passwordx); END;";
            const result = await database.simpleExecute(strQuery,data);
            socket.emit('message-action',{message:'Usuario EDITADO con EXITO'});
            socket.emit('redirect-page',{url:'/clients'});
        } catch (err) {
            socket.emit('message-action',{message:err});
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
            socket.emit('redirect-page',{url:'/clients'});
            
        } catch (err) {
            socket.emit('message-action',{message:err});
            //console.error(err);
        }
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

    socket.on('edit-account-client',async function(data){
        try {
            await database.initialize(); 
            console.log(data);
            var strQuery ="BEGIN PROCEDITACCOUNTCLIENT(:cod_cuentax,:estadox); END;";
            const result = await database.simpleExecute(strQuery,data);
            console.log(result);
            socket.emit('message-action',{message:'CUENTA de cliente EDITADA con EXITO'});
        } catch (err) {
            console.log(err);
            socket.emit('message-action',{message:err});
        }
    });

    socket.on('get-account-client',async function(data){
        if(!currentEdit['client-id']){
            socket.emit('message-action',{message:'SELECCIONE PRIMERO UN CLIENTE'});
            socket.emit('redirect-page',{url:'/clients'});
        }
        if(!currentEdit['account-id']){
            socket.emit('message-action',{message:'SELECCIONE PRIMERO UNA CUENTA'});
            socket.emit('redirect-page',{url:'/clients/'+currentEdit['client-id']+'/accounts'});
        }
        try {
            await database.initialize(); 
            var strQuery="SELECT CLIENTE.USUARIO,CLIENTE.COD_CLIENTE,CUENTA.COD_CUENTA,CUENTA.ESTADO,CUENTA.SALDO,CUENTA.RESERVA,CUENTA.DISPONIBLE,to_char(DETALLE_CUENTA.FECHA_APERTURA, 'DD-MM-YYYY') as fecha_apertura\n"+
            "FROM CUENTA\n"+
            "INNER JOIN DETALLE_CUENTA\n"+
            "ON CUENTA.COD_CUENTA=DETALLE_CUENTA.CUENTA_COD_CUENTA\n"+
            "INNER JOIN CLIENTE\n"+
            "ON DETALLE_CUENTA.CLIENTE_COD_CLIENTE=CLIENTE.COD_CLIENTE\n"+
            "where CLIENTE.COD_CLIENTE="+parseInt(currentEdit['client-id'])+"\n"+
            "and CUENTA.COD_CUENTA="+parseInt(currentEdit['account-id']);

            const result = await database.simpleExecute(strQuery);
            socket.emit('send_receive-account-client',result.rows[0]);
        } catch (err) {
            console.log(err);
            socket.emit('message-action',{message:err});
        }
    });

    socket.on('create-new-account-client',async function(data){
        if(!currentEdit['client-id']){
            socket.emit('message-action',{message:'SELECCION PRIMERO UN CLIENTE'});
            socket.emit('redirect-page',{url:'/clients'});
        }
        try {  
            await database.initialize(); 
            data.disponible=parseFloat(data.disponible);
            data.reserva=parseFloat(data.reserva);
            data.saldo=parseFloat(data.saldo);
            data['cliente_cod_cliente']=parseInt(currentEdit['client-id']);
            var strQuery ="BEGIN PROCCREATEACCOUNTCLIENT(:cliente_cod_cliente,:estado,:saldo,:reserva,:disponible,:fecha_apertura); END;";
            console.log(strQuery);
            const result = await database.simpleExecute(strQuery,data);
            socket.emit('message-action',{message:'CUENTA de Usuario CREADA con EXITO'});
            socket.emit('redirect-page',{url:'/clients/'+currentEdit['client-id']+'/accounts'});
        } catch (err) {
            console.log(err);
            socket.emit('message-action',{message:err});
        }
    });

    socket.on('get-all-accounts-client',async function(data){
        if(!currentEdit['client-id']){
            socket.emit('message-action',{message:'SELECCION PRIMERO UN CLIENTE'});
            socket.emit('redirect-page',{url:'/clients'});
        }
        //Open Conexion
        try {
            await database.initialize(); 
            var strQuery="SELECT CLIENTE.USUARIO,CLIENTE.COD_CLIENTE,CUENTA.COD_CUENTA,CUENTA.ESTADO,CUENTA.SALDO,CUENTA.RESERVA,CUENTA.DISPONIBLE,to_char(DETALLE_CUENTA.FECHA_APERTURA, 'DD-MM-YYYY') as fecha_apertura\n"+
            "FROM CUENTA\n"+
            "INNER JOIN DETALLE_CUENTA\n"+
            "ON CUENTA.COD_CUENTA=DETALLE_CUENTA.CUENTA_COD_CUENTA\n"+
            "INNER JOIN CLIENTE\n"+
            "ON DETALLE_CUENTA.CLIENTE_COD_CLIENTE=CLIENTE.COD_CLIENTE\n"+
            "where CLIENTE.COD_CLIENTE="+parseInt(currentEdit['client-id']);
            const result = await database.simpleExecute(strQuery);
            socket.emit('send_receive-all-accounts-user',result.rows);
        } catch (err) {
            console.log(err);
            socket.emit('message-action',{message:err});
            //console.error(err);
        }
    });

    socket.on('delete-account-client',async function(data){
        try {
            await database.initialize(); 
            data.cod_clientex=parseInt(data.cod_clientex);
            data.cod_cuentax=parseInt(data.cod_cuentax);
            var strQuery ="BEGIN PROCDELETEACCOUNTCLIENT(:cod_clientex,:cod_cuentax,:fecha_aperturax); END;";
            const result = await database.simpleExecute(strQuery,data);
            socket.emit('message-action',{message:'Cuenta de cliente  ELIMINADA con EXITO'});
            socket.emit('redirect-page',{url:'/clients/'+data.cod_clientex+'/accounts'});
            
        } catch (err) {
            socket.emit('message-action',{message:err});
            //console.error(err);
        }
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
