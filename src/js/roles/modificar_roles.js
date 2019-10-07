function cargarFormularioRol(){
    socket.emit('obtenerrol',null);
	socket.on('inforol', function(data) {
        if(data==null){
            alert('No se pudo encontrar el rol');
        }else{
            var codigo=document.getElementById('id_rol');
            var nombre=document.getElementById('id_nombre');
            var descripcion=document.getElementById('id_descripcion');
            var rango=document.getElementById('id_rango');
            codigo.value=data['COD_ROL'];
            nombre.value=data['NOMBRE'];
            descripcion.value=data['DESCRIPCION'];
            rango.value=data['RANGO'];
        }
	});	
}

function modificarRol(){
    var id_codigo=document.getElementById('id_rol').value;
    var id_nombre=document.getElementById('id_nombre').value;
    var id_descripcion=document.getElementById('id_descripcion').value;
    var id_rango=document.getElementById('id_rango').value;
    var data={
        codigo:id_codigo,
        nombre:id_nombre,
        descripcion:id_descripcion,
        rango:id_rango
    }
    socket.emit('updaterol',data);
    socket.on('rolupdate',function(data){
        if(data==null){
            alert('No se pudo actualizar el rol');
        }else{
            alert(data);
        }        
    });
}
