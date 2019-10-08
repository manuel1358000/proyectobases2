//Esta funcion manda a verificar los datos y luego manda al socket la data para meterla a la bd
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

//Editar agencias
//editar bancos
function cargarEdicion(){
    socket.emit('get-agencia',null);
}

//mostrar info de una agencia
function mostrarAgencia(data){
    //para los que no son banco
    let arrayKey = ['Nombre','Direccion','Fecha_Nac']; //campos html
    let arrayKeyRow = ['NOMBRE','DIRECCION','FECHA_APERTURA']; //datos en la tabla
    arrayKey.forEach(
        (key,count)=>{
            var elementDiv=document.getElementById('_input'+key);
            if(elementDiv!=null){
                elementDiv.value=data[arrayKeyRow[count]];
            }
        }
    );

    //para seleccionar el banco
    var banco = document.getElementById("inputbanco");
    banco.selectedIndex = data['BANCO_COD_LOTE'];
}

function editarAgencias(){
    const dataUser = validacionAgencias();
    if(dataUser!=null){
        console.log(dataUser);
        socket.emit('editar-agencia', dataUser);
    }else{
        alert('Por Favor Complete Todos Los Campos');
    }
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