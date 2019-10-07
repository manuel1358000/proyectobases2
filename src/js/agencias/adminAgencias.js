function creacionAgencias(){
    const dataUser = validacionAgencia();
    if(dataUser!=null){
        console.log(dataUser);
        socket.emit('obtener-agencia', null);
        socket.emit('crear-agencia', dataUser);
    }else{
        alert('Por Favor Complete Todos Los Campos');
    }
}

function validacionAgencias(){
    let arrayKey = ['Nombre','Direccion','Fecha','Banco'];
    var dataUser = {};
    var someNull=false;
    //aqui esta por elemento

    arrayKey.forEach(
        key=>{            
            var elementDiv=document.getElementById('_input'+key);
            if(elementDiv.value){
                dataUser[key.toLowerCase()]= elementDiv.value;
            }else{
                someNull=true;
            }
        }
    );
    return someNull?null:dataUser;
}


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
agregarBancos();