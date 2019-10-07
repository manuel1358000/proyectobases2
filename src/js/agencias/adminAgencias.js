function creacionAgencias(){
    const dataUser = validacionAgencias();
    if(dataUser!=null){
        console.log(dataUser);
        socket.emit('crear-agencia', dataUser);
    }else{
        alert('Por Favor Complete Todos Los Campos');
    }
}

//obtengo los input y si alguno es nulo entonces mando que se tiene que llenar todo el form
function validacionAgencias(){
    var dataUser = {};
    var someNull=false;
    
    var elementoNombre = document.getElementById("_inputNombre"); 
    var elementoDireccion = document.getElementById("_inputDireccion");
    var elementoFecha = document.getElementById("_inputFecha_Nac");
    var elementoBanco = document.getElementById("inputbanco");

    if(elementoNombre.value && elementoDireccion.value && elementoFecha.value){
        dataUser["nombre"]= elementoNombre.value;
        dataUser["direccion"]= elementoDireccion.value;
        dataUser["fecha"]= elementoFecha.value;
        dataUser["banco"]= elementoBanco.options[elementoBanco.selectedIndex].value;
    }

    return someNull?null:dataUser;
}

//funcion para el select de los bancos
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

//la corre la primera vez
agregarBancos();