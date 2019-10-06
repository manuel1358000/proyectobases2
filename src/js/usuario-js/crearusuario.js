function mostrarAgencias(){
	var agencia=document.getElementById('id_agencia');
	var opciones='';
	socket.emit('mostraragencias',null);
	socket.on('listamostraragencias', function(data) {
		for(var i=0;i<data.length;i++){
			opciones+='<option value="'+data[i].COD_AGENCIA+'">'+data[i].NOMBRE+'</option>';
		}
		agencia.insertAdjacentHTML('beforeend',opciones);
	});

}

function mostrarRol(){
	var rol=document.getElementById('id_rol');
	var opciones='';
	socket.emit('mostrarrol',null);
	socket.on('listamostrarrol', function(data) {
		for(var i=0;i<data.length;i++){
			opciones+='<option value="'+data[i].COD_ROL+'">'+data[i].NOMBRE+'</option>';
		}
		rol.insertAdjacentHTML('beforeend',opciones);
	});
}


function enviarFormulario(){
	var dpi=document.getElementById('id_dpi');
	var nombre=document.getElementById('id_nombre');
	var apellido=document.getElementById('id_apellido');
	var direccion=document.getElementById('id_direccion');
	var nacimiento=document.getElementById('id_nacimiento');
	var contratacion=document.getElementById('id_contratacion');
	var rol=document.getElementById('id_rol');
	var agencia=document.getElementById('id_agencia');
	var ventanilla=document.getElementById('id_ventanilla');	
	var valores={
		dpi:dpi.value,
		nombre:nombre.value,
		apellido:apellido.value,
		direccion:direccion.value,
		nacimiento:nacimiento.value,
		contratacion:contratacion.value,
		rol:rol.value,
		agencia:agencia.value,
		ventanilla:ventanilla.value
	};
	socket.emit('crearusuario',valores);
	socket.on('usuariocreado', function(data) {
		
	});	

}