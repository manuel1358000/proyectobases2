const express = require("express");
const session = require('express-session');
const fileUpload = require('express-fileupload');

var fs = require('fs');

const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');
const bodyParser = require('body-parser');
const database = require('./src/js/oracle-transactions/database.js');
database.initialize();
app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(express.static('src')); //Serves resources from public folder

//variable para edicion de formularios
var currentEdit ={};


var sess;
// default options
app.use(fileUpload());

app.get('/list-saldos',function(req,res){
    res.sendFile(path.join(__dirname+'/src/template/estadisticas/list-saldos.html')); //listado
});

app.get('/form-upload', function (req, res) {
    //sess=req.session;
    res.sendFile(path.join(__dirname+'/src/template/file-upload/file-upload.html')); //listado
    /*if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/file-upload/file-upload.html')); //listado
    }else{
        return res.redirect('/sign-in');
    }*/
});

app.get('/status-bulk-load',function(req,res){
    res.sendFile(path.join(__dirname+'/src/template/status-bulk-load/status-bulk-load.html'));
});

app.get('/status-bulk-load-extern',function(req,res){
    res.sendFile(path.join(__dirname+'/src/template/status-bulk-load-extern/status-bulk-load-extern.html'));
});

app.get('/status-bulk-load-out',function(req,res){
    res.sendFile(path.join(__dirname+'/src/template/status-bulk-load-extern/OUT/status-bulk-load-out.html'));
});

app.get('/status-bulk-load-in',function(req,res){
    res.sendFile(path.join(__dirname+'/src/template/status-bulk-load-extern/IN/status-bulk-load-in.html'));
});

app.get('/generator-file-out',function(req,res){
    res.sendFile(path.join(__dirname+'/src/template/status-bulk-load-extern/GEN/generator-out.html'));
});

app.get('/downloadOut', (req, res) => res.download(currentEdit.file_generated_out))

app.post('/upload', function(req, res) {
    
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.log;
  
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(__dirname+'/src/assets/'+req.files.log.name, function(err) {
      if (err)
        return res.status(500).send(err);      
      currentEdit['last_file']= __dirname+'/src/assets/'+req.files.log.name;
      currentEdit['option_bulkLoad']= req.body.selectOperationBuckLoad;
      //res.send('Cargado Exitosamente');
      switch(currentEdit.option_bulkLoad){
        case 'Archivos Conciliacion OUT':
            res.redirect('/status-bulk-load-out');
            break;
        case 'Archivos Conciliados IN[OK]':
            res.redirect('/status-bulk-load-in');
            break;    
        case 'Cheques Propios':
            res.redirect('/status-bulk-load');
            break;
      }
    });
});

app.get('/', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/index.html')); //listado
    }else{
        return res.redirect('/sign-in');
    }
});

app.post('/login',(req,res) => {
    sess = req.session;
    sess.email = req.body.email;
    res.end('done');
});


app.get('/admin',(req,res) => {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/index.html')); //listado
    }else{
        return res.redirect('/sign-in');
    }
});


/*INICIO - BANCOS */
app.get('/bancos', function (req, res) {
    sess=req.session;
    if(sess.email) {
        res.sendFile(path.join(__dirname+'/src/template/bancos/lista_bancos.html')); //listado
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/bancos/nuevo', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/bancos/creacion.html')); //creacion
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/bancos/editar/:uid',function(req,res){
    sess=req.session;
    if(sess.email){
        currentEdit=null;
        currentEdit=req.params.uid;
        res.sendFile(path.join(__dirname+'/src/template/bancos/editar.html'));
    }else{
        return res.redirect('/sign-in');
    }
});
/*FIN - BANCOS*/


/* PAGAR CHEQUE */
app.get('/ingresar-cheque', function (req, res) {
    //sess=req.session;
    //if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/ingresar-cheque/ingresar-cheque.html')); //listado
    //}else{
        //return res.redirect('/sign-in');
    //}
});


/*INICIO - AGENCIAS*/
app.get('/agencias', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/agencias/lista_agencias.html')); //listado
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/agencias/nuevo', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/agencias/creacion.html')); //creacion
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/agencias/editar/:uid',function(req,res){
    sess=req.session;
    if(sess.email){
        currentEdit=null;
        currentEdit=req.params.uid;
        res.sendFile(path.join(__dirname+'/src/template/agencias/editar.html'));
    }else{
        return res.redirect('/sign-in');
    }
});
/*FIN - AGENCIAS*/






/*INICIO - Clientes*/
app.get('/clients', function (req, res) {	
    //console.log(req.session);
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/clients-template/listClient.html'));
    }else{
        return res.redirect('/sign-in');
    }    
});

app.get('/clients/new', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/clients-template/newClient.html'));
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/clients/:uid',function(req,res){ 
    sess=req.session;
    if(sess.email){
        currentEdit['client-id']=req.params.uid;
        res.sendFile(path.join(__dirname+'/src/template/clients-template/editClient.html'));
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/clients/:uid/accounts',function(req,res){
    sess=req.session;
    if(sess.email){
        currentEdit['client-id']=req.params.uid;
        console.log(currentEdit);
        res.sendFile(path.join(__dirname+'/src/template/clients-template/accounts-template/listAccount.html'));
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/clients/:uid/accounts/new', function (req, res) {
    sess=req.session;
    if(sess.email){
        currentEdit['client-id']=req.params.uid;
        console.log(currentEdit);
        res.sendFile(path.join(__dirname+'/src/template/clients-template/accounts-template/newAccount.html'));
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/clients/:uid/accounts/:uidc',function(req,res){
    sess=req.session;
    if(sess.email){
        currentEdit['client-id']=req.params.uid;
        currentEdit['account-id']=req.params.uidc;
        console.log(currentEdit);
        res.sendFile(path.join(__dirname+'/src/template/clients-template/accounts-template/editAccount.html'));
    }else{
        return res.redirect('/sign-in');
    }
});
/**FIN - CLIENTES*/


/* INICIO-USUARIOS*/
app.get('/usuarios', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/usuarios/usuarios.html'));
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/crearusuario', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/usuarios/crearusuario.html'));
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/usuario/:uid',function(req,res){ 
    sess=req.session;
    if(sess.email){
        currentEdit['usuario-id']=req.params.uid;
        res.sendFile(path.join(__dirname+'/src/template/usuarios/modificar_usuario.html'));
    }else{
        return res.redirect('/sign-in');
    }
});
/**FIN - USUARIOS */




/**INICIO ROL */
app.get('/roles', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/roles/roles.html'));
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/crear_rol', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/roles/crear_rol.html'));
    }else{
        return res.redirect('/sign-in');
    }
});

app.get('/rol/:uid',function(req,res){ 
    sess=req.session;
    if(sess.email){
        currentEdit['rol-id']=req.params.uid;
        res.sendFile(path.join(__dirname+'/src/template/roles/modificar_rol.html'));
    }else{
        return res.redirect('/sign-in');
    }
});
/**FIN ROL */


/**INICIO CHEQUES */
app.get('/solicitar_chequera', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/cheques/solicitar_chequera.html'));
    }else{
        return res.redirect('/sign-in');
    }
});
app.get('/cancelacion_cheque', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/cheques/cancelacion_cheque.html'));
    }else{
        return res.redirect('/sign-in');
    }
});
/**FIN CHEQUES */


/**TRANSFERENCIA DE FONDOS - USUARIOS */

app.get('/transferencia_fondos',function(req,res){
    res.sendFile(path.join(__dirname+'/src/template/transferencia_fondos/transferencia_fondos.html'));
});


/**FIN  - TRANSFERENCIA DE FONDOS */

app.get('/consulta',async function(req,res){
    try {
        await database.initialize(); 
        const result=await database.simpleExecute("BEGIN DEPOSITO_CHEQUE(1,1,1,7,1,1,40,to_date('2019-01-01','YYYY-MM-DD'),6000); END;");
        if(result!=null){
            res.send('Cheque operado con exito');
        }
    } catch (err) {
        console.error(err.errorNum);
        res.send(err.errorNum.toString());
    }
});

/**INICIO SALDOS */
app.get('/consulta_saldo', function (req, res) {
    sess=req.session;
    if(sess.email){
        res.sendFile(path.join(__dirname+'/src/template/consulta_saldo/consulta_saldo.html'));
    }else{
        return res.redirect('/sign-in');
    }
});
/**FIN SALDOS */


/*INICIO - LOGIN */
app.get('/sign-in',function(req,res){
    sess=req.session;
    if(sess.email){
        return res.redirect('/admin');
    }
    res.sendFile(path.join(__dirname+'/src/template/sign-in-sign-up-templates/sign-in-template/sign-in-form.html'));
});

app.get('/sign-up',function(req,res){
    sess=req.session;
    if(sess.email){
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname+'/src/template/sign-in-sign-up-templates/sign-up-template/sign-up-form.html'));
});
/**FIN  - LOGIN */



app.get('/transacciones', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/auditoria/transacciones.html'));
});



io.on('connection', function(socket) {
    socket.on('eliminarusuario',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('delete from USUARIO where COD_USUARIO='+data);
            socket.emit('eliminacion',result);
        } catch (err) {
            console.error(err);
        }
    });
    socket.on('eliminar_rol',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('delete from ROL where COD_ROL='+data);
            socket.emit('rol_eliminado',result);
        } catch (err) {
            console.error(err);
        }
    });
    socket.on('bancos',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select COD_LOTE,NOMBRE from BANCO');
            socket.emit('listabancos',result.rows);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('agencias',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select COD_AGENCIA,NOMBRE from AGENCIA where BANCO_COD_LOTE='+data);
            console.log(result);
            socket.emit('listaagencias',result.rows);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('usuarios',async function(data){
        try {
            await database.initialize(); 
            if(data!=null){
                const result = await database.simpleExecute('select * from USUARIO where AGENCIA_COD_AGENCIA='+data);
                socket.emit('listausuarios',result.rows);
            }else{
                const result = await database.simpleExecute('select * from USUARIO');
                socket.emit('listausuarios',result.rows);
            }
            
        } catch (err) {
            console.error(err);
        }
    });
    socket.on('obtenerusuario',async function(data){
        if(currentEdit['usuario-id']==null)return;
        try {
            await database.initialize();
            const result=await database.simpleExecute('select COD_USUARIO,DPI,NOMBRES,APELLIDOS,DIRECCION,FECHA_NACIMIENTO,FECHA_CONTRATACION,ROL_COD_ROL,AGENCIA_COD_AGENCIA,VENTANILLA from usuario where cod_usuario='+currentEdit['usuario-id']);
            socket.emit('infousuario',result.rows[0]);
        } catch (err) {
            socket.emit('infousuario',null);
            //socket.emit('message-action',{message:err});
        }
    });
    socket.on('updateusuario',async function(data){
        try {
            console.log('Initializing database module');
            await database.initialize();
            var ts = new Date(data['fecha_nacimiento']);
            var fecha_nac=ts.getFullYear()+'-'+("0" + (ts.getMonth() + 1)).slice(-2)+'-'+("0" + (ts.getDay() + 1)).slice(-2);
            var fecha_contra=data['fecha_contratacion'];
            var ts2 = new Date(data['fecha_contratacion']);
            var fecha_contra=ts2.getFullYear()+'-'+("0"+(ts2.getMonth() + 1)).slice(-2)+'-'+("0" + (ts2.getDay() + 1)).slice(-2); 
            var strQuery ="update usuario set dpi="+data['dpi']+",nombres='"+data['nombres']+"',apellidos='"+data['apellidos']+"',direccion='"+data['direccion']+"',fecha_nacimiento=TO_DATE('"+fecha_nac+"','YYYY-MM-DD'),fecha_contratacion=TO_DATE('"+fecha_contra+"','YYYY-MM-DD'),rol_cod_rol="+data['rol']+",agencia_cod_agencia="+data['agencia']+",ventanilla="+data['ventanilla']+" where cod_usuario="+data['codigo'];
            const result = await database.simpleExecute(strQuery);
            socket.emit('usuarioupdate','Usuario Modificado Con Exito');
        } catch (err) {
            console.log(err);
            socket.emit('usuarioupdate',null);
        }
    });
    socket.on('solicitar_roles',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select * from ROL');
            socket.emit('lista_roles',result.rows);
        } catch (err) {
            console.error(err);
        }
    });
    socket.on('mostraragencias',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select COD_AGENCIA,NOMBRE from AGENCIA');
            socket.emit('listamostraragencias',result.rows);
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('mostrarrol',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select COD_ROL,NOMBRE from ROL');
            socket.emit('listamostrarrol',result.rows);
        } catch (err) {
            console.error(err);
        }
    });
    socket.on('updaterol',async function(data){
        try {
            console.log('Initializing database module');
            await database.initialize(); 
            var strQuery ="update rol set nombre='"+data['nombre']+"',descripcion="+data['descripcion']+",rango="+data['rango']+" where cod_rol="+data['codigo'];
            const result = await database.simpleExecute(strQuery);
            socket.emit('rolupdate',{message:'Rol EDITADO con EXITO'});
        } catch (err) {
            console.log(err);
            socket.emit('rolupdate',null);
        }
    });
    socket.on('obtenerrol',async function(data){
        if(currentEdit['rol-id']==null)return;
        try {
            await database.initialize();
            const result=await database.simpleExecute('select cod_rol,nombre,descripcion,rango from rol where cod_rol='+currentEdit['rol-id']);
            socket.emit('inforol',result.rows[0]);
        } catch (err) {
            socket.emit('inforol',null);
            //socket.emit('message-action',{message:err});
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
            var values = "Values( '" + data.direccion +"',TO_DATE('" + data.fecha + "','DD-MM-YYYY')," + data.banco + ",'" + data.nombre  +"' ) ";
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
        const set = "Set Direccion = '"+ data.direccion +"', Fecha_Apertura =TO_DATE('"+ data.fecha +"','DD-MM-YYYY'), NOMBRE = '"+ data.nombre +"', BANCO_COD_LOTE = " + data.banco;
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
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('delete from BANCO where COD_LOTE='+data['cod_bancox']);
            console.log(result);
            socket.emit('message-action',{message:'Se elimino correctamente el banco'});
        } catch (err) {
            console.error(err);
        }
    });

    //borrar agencia
    socket.on('borrar-agencia', async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('delete from AGENCIA where COD_AGENCIA='+data['cod_agenciax']);
            console.log(result);
            socket.emit('message-action',{message:'Se elimino correctamente la agencia'});
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
            const result = await database.simpleExecute('select cod_cliente,nombres, apellidos,usuario,direccion,to_char(fecha_nacimiento, \'DD-MM-YYYY\') as fecha_nacimiento from CLIENTE');
            socket.emit('send_receive-all-users',result.rows);
            console.log('Ingreso a Clientes');
        } catch (err) {
            console.log(err);
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
            var cadena="insert into USUARIO(DPI,NOMBRES,APELLIDOS,DIRECCION,FECHA_NACIMIENTO,FECHA_CONTRATACION,ROL_COD_ROL,AGENCIA_COD_AGENCIA,VENTANILLA)values("+
            +data.dpi+",'"+data.nombre+"','"+data.apellido+"','"+data.direccion+"',TO_DATE('"+nacimiento2+"','YYYY-MM-DD'),TO_DATE('"+contratacion2+"','YYYY-MM-DD'),"+data.rol+","+data.agencia+","+data.ventanilla+")";
            const result = await database.simpleExecute(cadena);
            socket.emit('usuariocreado','usuariocrearo');
        } catch (err) {
            console.error(err);
        }
    });
    socket.on('crearrol',async function(data){
        try {
            await database.initialize();
            var cadena="insert into ROL(NOMBRE,DESCRIPCION,RANGO)values('"+data.nombre+"',"+data.descripcion+","+data.rango+")";
            const result = await database.simpleExecute(cadena);
            socket.emit('rolcreado',result);
        } catch (err) {
            console.error(err);
        }
    });
    socket.on('crear_chequera',async function(data){
        try {
            await database.initialize();
            var cadena="insert into ROL(NOMBRE,DESCRIPCION,RANGO)values('"+data.nombre+"',"+data.descripcion+","+data.rango+")";
            const result = await database.simpleExecute(cadena);
            socket.emit('rolcreado',result);
        } catch (err) {
            console.error(err);
        }
    });
    socket.on('numero_cheques',async function({id_cuenta,...otherParams}){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select sum(no_cheques) as correlativo from chequera where cuenta_cod_cuenta='+id_cuenta);
            socket.emit('correlativo',{'result':result.rows[0],id_cuenta:id_cuenta,...otherParams});
        } catch (err) {
            console.error(err);
        }
    });
    socket.on('solicitar_chequera',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('BEGIN CREAR_CHEQUERA('+data['no_cheques']+',TO_DATE(\''+data['fecha_emision']+'\',\'YYYY-MM-DD\'),\''+data['estado']+'\','+data['cuenta_cod_cuenta']+','+data['ultimo_cheque']+'); END;');
            console.log(result);
            socket.emit('message-action',{message:'SOLICITUD DE CHEQUERA REALIZADA'})
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('rango_chequera',async function(data){
        try {
            await database.initialize(); 
            const result = await database.simpleExecute('select ULTIMO_CHEQUE,NO_CHEQUES from chequera where cod_chequera='+data['chequera']);
            socket.emit('rango_cheques',result.rows[0]);
            console.log(result.rows[0]);
        } catch (err) {
            console.log(err);
        }
    });
    socket.on('cancelar_cheque',async function (data){
        try{
            var d=new Date();
            var dd=d.getDate();
            var mm=d.getMonth()+1;
            var yy=d.getFullYear();
            var fecha=yy+"/"+mm+"/"+dd;
            await database.initialize(); 
            var string='insert into cheque(fecha,estado,no_cheque,chequera_cod_chequera)values(TO_DATE(\''+fecha+'\',\'YYYY-MM-DD\'),\''+data['razon']+'\','+data['no_cheque']+','+data['no_chequera']+')';
            const result = await database.simpleExecute(string);
            console.log(result);
        }catch(err) {
            console.log(err);
        }
    });
    socket.on('realizar_transferencia',async function (data){
        try{
            await database.initialize();
            var query='begin transferencia_fondos('+data['usuario']+','+data['agencia']+','+data['cuenta_origen']+','+data['cuenta_destino']+','+data['monto']+'); commit; end;';
            const result=await database.simpleExecute(query);
            socket.emit('message-action',{message:'Transferencia Realizada'});
            socket.emit('redirect-page',{url:'/transferencia_fondos'});
            console.log('Se realizo la transaccion');
        }catch(err) {
            console.log(err);
            socket.emit('message-action',{message:'No se pudo realizar la transferencia, verificar el log'});
            socket.emit('redirect-page',{url:'/transferencia_fondos'});
        }
    });
    socket.on('consulta_saldo',async function(data){
        try{
            await database.initialize();
            var query='SELECT SALDO,RESERVA,DISPONIBLE from cuenta where cod_cuenta='+data;
            const result=await database.simpleExecute(query);
            if(result.rows.length>0){
                socket.emit('datos_saldo',result.rows);
                socket.emit('message-action',{message:'Consulta Realizada'});
            }else{
                socket.emit('message-action',{message:'No existe la cuenta solicitada'});
                socket.emit('redirect-page',{url:'/consulta_saldo'});
                
            }
        }catch(err){
            socket.emit('message-action',{message:'No se pudo realizar la consulta de saldo'});
            socket.emit('redirect-page',{url:'/consulta_saldo'});
            console.log(err);
        }
    });
    socket.on('sign-in-event',function(data){
        try {
            console.log(data);
            if(data.usuario=="admin" && data.password=="admin"){
                sess.email=data.usuario;
                console.log(sess);
            }
        } catch (error) {
        }
    });
    socket.on('execute-bulk-load',async function(data){
        var index = data.index;
        delete data.index;
        try {
            //await database.initialize();
            var strQuery ="BEGIN DEPOSITO_CHEQUE(:p_usuario,:p_agencia,:p_cuenta_destino,:p_cuenta_cheque,:p_banco_actual,:p_banco_cheque,:p_numero_cheque,:p_fecha_cheque,:p_monto_cheque); END;";
            var strQuery2 ="BEGIN DEPOSITO_CHEQUE_EXTERNO(:p_usuario,:p_agencia,:p_cuenta_destino,:p_cuenta_cheque,:p_banco_actual,:p_banco_cheque,:p_numero_cheque,:p_fecha_cheque,:p_monto_cheque); END;";
            data.p_usuario=parseInt(data.p_usuario);
            data.p_agencia=parseInt(data.p_agencia);
            data.p_cuenta_destino=parseInt(data.p_cuenta_destino);
            data.p_cuenta_cheque=parseInt(data.p_cuenta_cheque);
            data.p_banco_actual=parseInt(data.p_banco_actual);
            data.p_banco_cheque=parseInt(data.p_banco_cheque);
            data.p_numero_cheque=parseInt(data.p_numero_cheque);
            data.p_fecha_cheque=data.p_fecha_cheque.replace('\'','');
            data.p_fecha_cheque=data.p_fecha_cheque.replace('\'','');
            data.p_monto_cheque=parseFloat(data.p_monto_cheque);
            console.log('BeginTransaccion:'+(index));
            if(data.p_banco_actual==data.p_banco_cheque){
                database.simpleExecute(strQuery,data).then(async (result)=>{
                    console.log(result);
                    console.log('FinishTransaccion:'+(index));
                    socket.emit('response-bulk-load-item',{message:'Transaccion Exitosa',failed:false,num:index});
                }).catch((e)=>{
                    console.log(e);
                    socket.emit('response-bulk-load-item',{message:e.errorNum+'',failed:true,num:index});
                });
            }else{
                database.simpleExecute(strQuery2,data).then(async(result)=>{
                    console.log(result);
                    console.log('FinishTransaccion:'+(index));
                    socket.emit('response-bulk-load-item',{message:'Transaccion Exitosa',failed:false,num:index});
                }).catch((e)=>{
                    console.log(e);
                    socket.emit('response-bulk-load-item',{message:e.errorNum+'',failed:true,num:index});
                });
                
            }
            /*database.simpleExecute("SELECT DISTINCT(banco) FROM CHEQUE_TEMPORAL where LOTE_COD_LOTE is null order by banco").then((result)=>{
                console.log(result.rows);
            }).catch((e)=>{
                console.log(e);
            });*/
            /*var strQuery3 ="SELECT BANCO,COD_CHEQUE_TEMPORAL AS REFERENCIA,CUENTA,CHEQUE AS NO_CHEQUE,VALOR AS MONTO FROM CHEQUE_TEMPORAL WHERE BANCO=3 AND LOTE_COD_LOTE IS NULL";
            database.simpleExecute(strQuery3).then((result)=>{
                console.log(result.rows);
            }).catch((e)=>{
                console.log(e);
            });*/
            console.log('Transaccion No.'+index);
        } catch (err) {
            console.log('ErrorTransaccion:'+index);
            console.log(err);
            socket.emit('response-bulk-load-item',{message:err,failed:true,num:index});
            //socket.emit('message-action',{message:err});
        }
    });

    socket.on('execute-insert-check',async function(data){
        var index = 1;
        try {
            var strQuery ="BEGIN DEPOSITO_CHEQUE(:p_usuario,:p_agencia,:p_cuenta_destino,:p_cuenta_cheque,:p_banco_actual,:p_banco_cheque,:p_numero_cheque,:p_fecha_cheque,:p_monto_cheque); END;";
            var strQuery2 ="BEGIN DEPOSITO_CHEQUE_EXTERNO(:p_usuario,:p_agencia,:p_cuenta_destino,:p_cuenta_cheque,:p_banco_actual,:p_banco_cheque,:p_numero_cheque,:p_fecha_cheque,:p_monto_cheque); END;";
            console.log('BeginTransaccion:'+(index));
            if(data.p_banco_actual==data.p_banco_cheque){
                database.simpleExecute(strQuery,data).then(async (result)=>{
                    console.log(result);
                    console.log('FinishTransaccion:'+(index));
                    socket.emit('message-action',{message:'Transaccion Exitosa',failed:false,num:index});
                }).catch((e)=>{
                    console.log(e);
                    socket.emit('message-action',{message:e.errorNum+'',failed:true,num:index});
                });
            }else{
                database.simpleExecute(strQuery2,data).then(async (result)=>{
                    console.log(result);
                    console.log('FinishTransaccion:'+(index));
                    socket.emit('message-action',{message:'Transaccion Exitosa',failed:false,num:index});
                }).catch((e)=>{
                    console.log(e);
                    socket.emit('message-action',{message:errorTypes[e.errorNum]+''});
                });
            }
        } catch (err) {
            console.log(err);
            socket.emit('message-action',{message:err});
        }
    });


    socket.on('execute-bulk-load-in-tmp',async function(data){
        const {p_banco, p_referencia, p_cuenta, p_cheque, p_monto, p_estado,index} = data;
        var strNameGrabador='GRABAR_CHEQUES_COMPENSADOS';
        var indeXx = data.index;
        delete data.index;
        try {
            await database.initialize();
            if(data['operando']){
                delete data.operando;
                strNameGrabador='OPERAR_CHEQUES_COMPENSADOS';
            }
            var strQuery ="BEGIN "+strNameGrabador+"(:p_banco,:p_referencia,:p_cuenta,:p_cheque,:p_monto,:p_estado); END;";
            data.p_banco=parseInt(p_banco);
            data.p_referencia=parseInt(p_referencia);
            data.p_cuenta=parseInt(p_cuenta);
            data.p_cheque=parseInt(p_cheque);
            data.p_monto=parseFloat(p_monto);
            console.log('BeginTransaccion:'+(indeXx));
            database.simpleExecute(strQuery,data).then(async(result)=>{
                console.log(result);
                console.log('FinishTransaccion:'+(indeXx));
                socket.emit('response-bulk-load-item',{message:'Transaccion Exitosa',failed:false,num:indeXx});
            }).catch((e)=>{
                console.log(e);
                socket.emit('response-bulk-load-item',{message:e.errorNum+'',failed:true,num:indeXx});
            });
        } catch (err) {
            console.log('ErrorTransaccion:'+indeXx);
            console.log(err);
            socket.emit('response-bulk-load-item',{message:err,failed:true,num:indeXx});
        }
    });

    socket.on('execute-bulk-load-out-tmp',async function(data){
        const {p_banco, p_referencia, p_cuenta, p_cheque, p_monto, p_banco_destino} = data;
        var indeXx = data.index;
        delete data.index;
        try {
            await database.initialize();
            var strQuery ="BEGIN GRABAR_CHECOMP_PROPIO(:p_banco,:p_referencia,:p_cuenta,:p_cheque,:p_monto,:p_banco_destino); END;";
            data.p_banco=parseInt(p_banco);
            data.p_referencia=parseInt(p_referencia);
            data.p_cuenta=parseInt(p_cuenta);
            data.p_cheque=parseInt(p_cheque);
            data.p_monto=parseFloat(p_monto);
            data.p_banco_destino=parseFloat(p_banco_destino);
            console.log('BeginTransaccion:'+(indeXx));
            database.simpleExecute(strQuery,data).then((result)=>{
                console.log(result);
                console.log('FinishTransaccion:'+(indeXx));
                socket.emit('response-bulk-load-item',{message:'Transaccion Exitosa',failed:false,num:indeXx});
            }).catch((e)=>{
                console.log(e);
                socket.emit('response-bulk-load-item',{message:e.errorNum+'',failed:true,num:indeXx});
            });
        } catch (err) {
            console.log('ErrorTransaccion:'+indeXx);
            console.log(err);
            socket.emit('response-bulk-load-item',{message:err,failed:true,num:indeXx});
        }
    });

    socket.on('get-data-from-last-file',async function(data){
       try {
           
           if(currentEdit.last_file){
                const val=await readFile(currentEdit.last_file);
                var filename = path.parse(currentEdit.last_file).base;
                socket.emit('receive-data-from-last-file',{content:val,option_bulkLoad:currentEdit.option_bulkLoad,filename:filename});
           }else{
               console.log('last_file is empty');
           }
       } catch (error) {
           
       } 
    });
    socket.on('recorderVerification',function({valor,lines,noDocuments}){
        try {
            var total=0;
            lines.forEach(element => {
                var lineArray=element.split('|');
                total += parseFloat(lineArray[4]);
            });
            var isOK = lines.length==noDocuments && parseFloat(total)==parseFloat(valor);
            console.log(isOK);
            socket.emit('receive-verification-recorder-server',{result:isOK});
        } catch (error) {
            console.log(error);
        }        
    });
    socket.on('get-all-banks-generator',async function(data){

        try{
            await database.initialize();
            var query='SELECT DISTINCT(banco) FROM CHEQUE_TEMPORAL where LOTE_COD_LOTE is null order by banco';
            const result=await database.simpleExecute(query);
            
            socket.emit('receive-all-banks-generator',{data:result.rows});
            /*
            socket.emit('receive-all-banks-generator',{url:'/transferencia_fondos'});
            console.log('Se realizo la transaccion');*/
        }catch(err) {
            console.log(err);
            socket.emit('message-action',{message:'Error al seleccionar bancos'});
        }
     });

     socket.on('generate-out-file-bank',async function({id}){

        try{
            await database.initialize();
            var query='SELECT BANCO,COD_CHEQUE_TEMPORAL AS REFERENCIA,CUENTA,CHEQUE AS NO_CHEQUE,VALOR AS MONTO '+
            'FROM CHEQUE_TEMPORAL '+
            'WHERE BANCO='+parseInt(id)+' AND LOTE_COD_LOTE IS NULL';
            const result=await database.simpleExecute(query);
            var strOut=result.rows.map( ({BANCO,REFERENCIA,CUENTA,NO_CHEQUE,MONTO})=>{
                return BANCO+'|'+REFERENCIA+'|'+CUENTA+'|'+NO_CHEQUE+'|'+MONTO;
            }).join('\n');
            var total = result.rows.reduce((previus,{MONTO})=>previus=previus+MONTO,0);
            console.log(total);

            var filename_=__dirname+'/src/assets/OUT_'+id+'_'+result.rows.length+'_'+total+'.txt'
            await writeFile(filename_,strOut);
            currentEdit['file_generated_out']=filename_;
            socket.emit('redirect-page-no-reload',{url:'/downloadOut'});
        }catch(err) {
            console.log(err);
            socket.emit('message-action',{message:'Error al generar el archivo OUT del banco'+id});
        }
     });
     socket.on('transacciones',async function(data){
        try {
            if(data==null){
                await database.initialize(); 
                const select = "SELECT T.COD_TRANSACCION, T.FECHA, T.TIPO, T.NATURALEZA, T.SALDO_INICIAL, T.VALOR, T.SALDO_FINAL, T.AUTORIZACION, T.RECHAZO, T.RAZON_RECHAZO, T.DOCUMENTO, A.NOMBRE, T.USUARIO_COD_USUARIO, T.CUENTA_COD_CUENTA ";
                const from = "FROM TRANSACCION T, AGENCIA A, USUARIO U ";
                const where = "WHERE T.AGENCIA_COD_AGENCIA = a.cod_agencia ";
                const and1 = "AND t.usuario_cod_usuario= u.cod_usuario ";
                const group = "ORDER BY t.cod_transaccion ";
                const result = await database.simpleExecute(select + from + where + and1+ group);
                socket.emit('listatrans',result.rows);
            }
            else{
                await database.initialize(); 
                const select = "SELECT T.COD_TRANSACCION, T.FECHA, T.TIPO, T.NATURALEZA, T.SALDO_INICIAL, T.VALOR, T.SALDO_FINAL, T.AUTORIZACION, T.RECHAZO, T.RAZON_RECHAZO, T.DOCUMENTO, A.NOMBRE, T.USUARIO_COD_USUARIO, T.CUENTA_COD_CUENTA ";
                const from = "FROM TRANSACCION T, AGENCIA A, USUARIO U ";
                const where = "WHERE T.AGENCIA_COD_AGENCIA = a.cod_agencia ";
                const and1 = "AND t.usuario_cod_usuario= u.cod_usuario ";
                const and2 = "AND a.banco_cod_lote = " + data + " ";
                const group = "ORDER BY t.cod_transaccion ";
                const result = await database.simpleExecute(select + from + where + and1 + and2 + group);
                socket.emit('listatrans',result.rows);
            }

            
        } catch (err) {
            console.error(err);
        }
    });

    socket.on('transacciones-fecha',async function(data){
        try{
            if(data == null){
                await database.initialize(); 
                const select = "SELECT T.COD_TRANSACCION, T.FECHA, T.TIPO, T.NATURALEZA, T.SALDO_INICIAL, T.VALOR, T.SALDO_FINAL, T.AUTORIZACION, T.RECHAZO, T.RAZON_RECHAZO, T.DOCUMENTO, A.NOMBRE, T.USUARIO_COD_USUARIO, T.CUENTA_COD_CUENTA ";
                const from = "FROM TRANSACCION T, AGENCIA A, USUARIO U ";
                const where = "WHERE T.AGENCIA_COD_AGENCIA = a.cod_agencia ";
                const and1 = "AND t.usuario_cod_usuario= u.cod_usuario ";
                const group = "ORDER BY t.cod_transaccion ";
                const result = await database.simpleExecute(select + from + where + and1+ group);
                socket.emit('listatrans-fecha',result.rows);
            }
            else{
                await database.initialize(); 
                const select = "SELECT T.COD_TRANSACCION, T.FECHA, T.TIPO, T.NATURALEZA, T.SALDO_INICIAL, T.VALOR, T.SALDO_FINAL, T.AUTORIZACION, T.RECHAZO, T.RAZON_RECHAZO, T.DOCUMENTO, A.NOMBRE, T.USUARIO_COD_USUARIO, T.CUENTA_COD_CUENTA ";
                const from = "FROM TRANSACCION T, AGENCIA A, USUARIO U ";
                const where = "WHERE T.AGENCIA_COD_AGENCIA = a.cod_agencia ";
                const and1 = "AND t.usuario_cod_usuario= u.cod_usuario ";
                const and2 = "AND t.fecha = TO_DATE('" + data+ "','DD-MM-YYYY') ";
                const group = "ORDER BY t.cod_transaccion ";
                const result = await database.simpleExecute(select + from + where + and1 + and2 + group);
                console.log(select + from + where + and1 + and2 + group);
                socket.emit('listatrans-fecha',result.rows);
            }
        }catch(err){
            console.error(err);
        }
    });
    socket.on('transacciones-cuenta',async function(data){
        try{
            if(data == null){
                const select = "SELECT T.COD_TRANSACCION, T.FECHA, T.TIPO, T.NATURALEZA, T.SALDO_INICIAL, T.VALOR, T.SALDO_FINAL, T.AUTORIZACION, T.RECHAZO, T.RAZON_RECHAZO, T.DOCUMENTO, A.NOMBRE, U.USUARIO, T.CUENTA_COD_CUENTA ";
                const from = "FROM TRANSACCION T, AGENCIA A, USUARIO U ";
                const where = "WHERE T.AGENCIA_COD_AGENCIA = a.cod_agencia ";
                const and1 = "AND t.usuario_cod_usuario= u.cod_usuario ";
                const group = "ORDER BY t.cod_transaccion ";
                const result = await database.simpleExecute(select + from + where + and1+ group);
                socket.emit('listatrans-cuenta',result.rows);
            }
            else{
                await database.initialize(); 
                const select = "SELECT T.COD_TRANSACCION, T.FECHA, T.TIPO, T.NATURALEZA, T.SALDO_INICIAL, T.VALOR, T.SALDO_FINAL, T.AUTORIZACION, T.RECHAZO, T.RAZON_RECHAZO, T.DOCUMENTO, A.NOMBRE, U.USUARIO, T.CUENTA_COD_CUENTA ";
                const from = "FROM TRANSACCION T, AGENCIA A, USUARIO U ";
                const where = "WHERE T.AGENCIA_COD_AGENCIA = a.cod_agencia ";
                const and1 = "AND t.usuario_cod_usuario= u.cod_usuario ";
                const and2 = "AND t.cuenta_cod_cuenta = " + data  + " ";
                const group = "ORDER BY t.cod_transaccion ";
                const result = await database.simpleExecute(select + from + where + and1 + and2 + group);
                socket.emit('listatrans-cuenta',result.rows);
            }
        }catch(err){
            console.error(err);
        }
    });
    //Estadisticas Consulta 1
    socket.on('list-saldos-accounts',async function(data){
        try{
            await database.initialize();
            var query='SELECT SUM(c.disponible)as Disponible, SUM(c.saldo) as Saldo, SUM(reserva) as Reserva'+
                        ' FROM cuenta c';
            const result=await database.simpleExecute(query);
            console.log(result);
            socket.emit('generate-bar-chart',result.rows);
        }catch(err){
            socket.emit('message-action',{message:'Error al consultar saldos de cuentas'+err});
            console.log(err);
        }
    });

    //Estadisticas Consulta 2   
    socket.on('clients-greater-deposits',async function(data){
        try{
            await database.initialize();
            var query='SELECT t.cuenta_cod_cuenta as "cuenta" , count(t.cuenta_cod_cuenta) as "NumeroDep" '+
            'FROM transaccion t '+
            'WHERE t.agencia_cod_agencia = 1'+
            'AND t.tipo = \'DEPOSITO\' '+
            'GROUP BY t.cuenta_cod_cuenta ORDER BY count(t.cuenta_cod_cuenta) DESC';
            const result=await database.simpleExecute(query);
            console.log(result);
            socket.emit('generate-table-chart',{...result,information:'Clientes Con MaYor # de Depositos'});
        }catch(err){
            socket.emit('message-action',{message:'Error al consultar clientes con mayor numero de depositos'+err});
            console.log(err);
        }
    });
    //Estadistica Consulta 3
    socket.on('clients-greater-checks',async function(data){
        try{
            await database.initialize();
            var query='SELECT t.cuenta_cod_cuenta as "cuenta" , SUM(t.valor) as "NumeroCheq" '+
            'FROM transaccion t '+
            'WHERE t.agencia_cod_agencia = 1 '+
            'AND t.tipo= \'RETIRO\' '+
            'AND t.naturaleza = \'CHEQUE\' '+
            'GROUP BY t.cuenta_cod_cuenta';
            console.log(query);
            const result=await database.simpleExecute(query);
            console.log(result);
            socket.emit('generate-table-chart',{...result,information:'Clientes Con MaYor # Cheques'});
        }catch(err){
            socket.emit('message-action',{message:'Error al consultar clientes con mayor numero de depositos'+err});
            console.log(err);
        }
    });
    //Estadistica Consulta 4
    socket.on('clients-without-deposit',async function(data){
        try{
            await database.initialize();
            var query='SELECT cl.nombres '+
            'FROM cliente cl, cuenta cu '+
            'WHERE cl.cod_cliente = cu.cod_cuenta '+
            'AND cu.cod_cuenta NOT IN( ' +
                                        'SELECT t.cuenta_cod_cuenta '+
                                        'FROM transaccion t '+
                                        'WHERE t.agencia_cod_agencia = 1 '+
                                        'AND t.tipo = \'DEPOSITO\' '+
                                    ')';
            console.log(query);

            const result=await database.simpleExecute(query);
            socket.emit('generate-table-chart',{...result,information:'Clientes Sin Depositos'});
        }catch(err){
            /*socket.emit('message-action',{message:'No se pudo realizar la consulta de saldo'});
            socket.emit('redirect-page',{url:'/consulta_saldo'});*/
            console.log(err);
        }
    });
});

function readFile(fileName) {
    return new Promise((resolve, reject) => {
      fs.readFile(fileName, 'utf8', function (error, data) {
        if (error) return reject(error);
        //console.log(fileName)
        //console.log(data)
        resolve(data);
      })
    });
}

async function writeFile(Filename,data){
    await fs.writeFileSync(Filename, data);
}

server.listen(3000,'192.168.1.46', function() {
	console.log('Servidor corriendo en http://192.168.1.46:3000');
});



const errorTypes={
    '20010':'FECHA INVALIDA',
    '20020':'CHEQUE NO PERTENECE A LA CUENTA',
    '20030':'CHEQUE PAGADO/EXTRAVIADO/CANCELADO',
    '20040':'CUENTA CHEQUE SIN FONDOS',
    '20060':'COMPENSACION RECHAZADA'
  }