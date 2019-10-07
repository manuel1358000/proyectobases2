function agregarBancos(){	
	var bancos=document.getElementById('inputbanco');
	var opciones='';
	socket.emit('bancos',null);
	socket.on('listabancos', function(data) {
		for(var i=0;i<data.length;i++){
			opciones+='<option value="'+data[i].COD_LOTE+'">'+data[i].NOMBRE+'</option>';
		}
		bancos.insertAdjacentHTML('beforeend',opciones);
	});
}

function actualizarAgencias(){
	var idbanco = document.getElementById("inputbanco");
	var banco = idbanco.options[idbanco.selectedIndex].value;
	agregarAgencias(banco);
}

function agregarAgencias(banco_seleccionado){
	var agencia=document.getElementById('inputagencia');
	var opciones_agencias='no existen agencias';
	socket.emit('agencias',banco_seleccionado);
	socket.on('listaagencias',function(data){
		for(var i=0;i<data.length;i++){
			opciones_agencias+='<option value="'+data[i].COD_AGENCIA+'">'+data[i].NOMBRE+'</option>';
		}
		agencia.innerHTML=opciones_agencias;
	});
}

function actualizarTabla(){
	var idagencia = document.getElementById("inputagencia");
	var agencia;
	if(idagencia.options[idagencia.selectedIndex]==null){
		agencia==null;
	}else{
		agencia = idagencia.options[idagencia.selectedIndex].value;
	}
	
	var tabla_usuarios=document.getElementById("tabla_usuarios");
	var info_tabla='';
	socket.emit('usuarios',agencia);
	socket.on('listausuarios',function(data){
		for(var i=0;i<data.length;i++){
			info_tabla+='<tr><th>'+data[i].COD_USUARIO+'</th><th>'+data[i].DPI+'</th>';
			info_tabla+='<th>'+data[i].NOMBRES+'</th><th>'+data[i].APELLIDOS+'</th>';
			info_tabla+='<th>'+data[i].DIRECCION+'</th><th>'+data[i].FECHA_NACIMIENTO+'</th>';
			info_tabla+='<th>'+data[i].FECHA_CONTRATACION+'</th><th>'+data[i].ROL_COD_ROL+'</th>';
			info_tabla+='<th>'+data[i].AGENCIA_COD_AGENCIA+'</th><th>'+data[i].VENTANILLA+'</th>';
			info_tabla+="<td><button type='button' class='btn btn-info' onclick=\"window.location.href='/usuario/"+data[i].COD_USUARIO+"'\">Modificar</button></td>"
			info_tabla+='<td><button type="button" onclick="eliminarUsuario('+data[i].COD_USUARIO+')" class="btn btn-danger">Eliminar</button></td></tr>';
		}	
		tabla_usuarios.innerHTML=info_tabla;
	});
}
function eliminarUsuario(COD_USUARIO){
	if(confirm('¿Desea eliminar el registro?')){
		socket.emit('eliminarusuario',COD_USUARIO);
		socket.on('eliminacion',function(data){
			console.log(data);
			actualizarTabla();
		});
	}
}
actualizarTabla();
agregarBancos();