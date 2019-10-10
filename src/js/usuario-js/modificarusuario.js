function cargarFormularioUsuario(){
    socket.emit('obtenerusuario',null);
	socket.on('infousuario', function(data) {
        if(data==null){
            alert('No se pudo encontrar el rol');
        }else{
            console.log(data);
            var codigo=document.getElementById('id_usuario');
            var dpi=document.getElementById('id_dpi');
            var nombres=document.getElementById('id_nombre');
            var apellidos=document.getElementById('id_apellido');
            var direccion=document.getElementById('id_direccion');
            var fecha_nacimiento=document.getElementById('id_nacimiento');
            var fecha_contratacion=document.getElementById('id_contratacion');
            var ventanilla=document.getElementById('id_ventanilla');
            codigo.value=data['COD_USUARIO'];
            dpi.value=data['DPI'];
            nombres.value=data['NOMBRES'];
            apellidos.value=data['APELLIDOS'];
            direccion.value=data['DIRECCION'];
            fecha_nacimiento.value=data['FECHA_NACIMIENTO'];
            fecha_contratacion.value=data['FECHA_CONTRATACION'];
            ventanilla.value=data['VENTANILLA'];
            mostrarRol(data['ROL_COD_ROL']);
            mostrarAgencias(data['AGENCIA_COD_AGENCIA']);
        }
	});	
}
function mostrarRol(codigo){
	var rol=document.getElementById('id_rol');
	var opciones='';
	socket.emit('mostrarrol',null);
	socket.on('listamostrarrol', function(data) {
		for(var i=0;i<data.length;i++){
            if(codigo==data[i].COD_ROL){
                opciones='<option value="'+data[i].COD_ROL+'">'+data[i].NOMBRE+'</option>'+opciones;
            }else{
                opciones+='<option value="'+data[i].COD_ROL+'">'+data[i].NOMBRE+'</option>';
            }
		}
		rol.insertAdjacentHTML('beforeend',opciones);
	});
}

function mostrarAgencias(agencia){
	var agencia=document.getElementById('id_agencia');
	var opciones='';
	socket.emit('mostraragencias',null);
	socket.on('listamostraragencias', function(data) {
		for(var i=0;i<data.length;i++){
            if(agencia==data[i].COD_AGENCIA){
                opciones='<option value="'+data[i].COD_AGENCIA+'">'+data[i].NOMBRE+'</option>'+opciones;
            }else{
                opciones+='<option value="'+data[i].COD_AGENCIA+'">'+data[i].NOMBRE+'</option>';
            }
		}
		agencia.insertAdjacentHTML('beforeend',opciones);
	});

}

function modificarUsuario(){
    var codigo=document.getElementById('id_usuario').value;
    var dpi=document.getElementById('id_dpi').value;
    var nombres=document.getElementById('id_nombre').value;
    var apellidos=document.getElementById('id_apellido').value;
    var direccion=document.getElementById('id_direccion').value;
    var fecha_nacimiento=document.getElementById('id_nacimiento').value;
    var fecha_contratacion=document.getElementById('id_contratacion').value;
    var ventanilla=document.getElementById('id_ventanilla').value;
    var agencia=document.getElementById('id_agencia').value;
    var rol=document.getElementById('id_rol').value;
    var data={
        codigo:codigo,
        dpi:dpi,
        nombres:nombres,
        apellidos:apellidos,
        direccion:direccion,
        fecha_nacimiento:fecha_nacimiento,
        fecha_contratacion:fecha_contratacion,
        ventanilla:ventanilla,
        agencia:agencia,
        rol:rol
    }
    socket.emit('updateusuario',data);
    socket.on('usuarioupdate',function(data){
        if(data==null){
            alert('No se pudo actualizar el usuario');
        }else{
            alert(data);
        }        
    });
}
