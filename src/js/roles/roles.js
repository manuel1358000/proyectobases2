function cargarRoles(){
    var tabla_roles=document.getElementById('tabla_roles');
    var info_tabla='';
    socket.emit('solicitar_roles',null);
    tabla_roles.innerHTML='';
	socket.on('lista_roles', function(data) {
		for(var i=0;i<data.length;i++){
			info_tabla+='<tr><th>'+data[i].COD_ROL+'</th>';
			info_tabla+='<th>'+data[i].NOMBRE+'</th><th>'+data[i].DESCRIPCION+'</th>';
			info_tabla+='<th>'+data[i].RANGO+'</th>';
			info_tabla+='<td><button type="button" class="btn btn-info" >Modificar</button></td>'
			info_tabla+='<td><button type="button" onclick="eliminarRol('+data[i].COD_ROL+')" class="btn btn-danger">Eliminar</button></td></tr>';
		}	
		tabla_roles.innerHTML=info_tabla;
	});   
}

function eliminarRol(cod_rol){
	if(confirm('¿Desea eliminar el Rol?')){
		socket.emit('eliminar_rol',cod_rol);
		socket.on('rol_eliminado',function(data){
            console.log(data);
			cargarRoles();
		});
	}
}
cargarRoles();