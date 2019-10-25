//Realizar deposito
function emitDepositar(){
    const dataDeposito = validationDeposito(1);
    if(dataDeposito!=null){
        socket.emit('create-new-deposito', dataDeposito);
    }else{
        alert('Por Favor Complete Todos Los Campos');
    }
}

//verificacion de datos
function validationDeposito(){
    let arrayKey = ['Numero','Monto'];
    var dataUser = {};
    var someNull=false;
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