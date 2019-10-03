//-----------------------------CREATE
function emitCreationAccount_User(){
    const dataAccount = validationFormNewAccount();
    if(dataAccount!=null){
        var today = new Date();
        dataAccount['fecha_apertura']=today.toLocaleDateString('en-GB');
        console.log(dataAccount);
        socket.emit('create-new-account-client', dataAccount);
    }else{
        alert('Por Favor Complete Todos Los Campos');
    }
}

function validationFormNewAccount(){
    let arrayKey = ['Estado','Saldo','Reserva','Disponible'];
    var dataAccount = {};
    var someNull=false;
    arrayKey.forEach(
        key=>{
            var elementDiv=document.getElementById('_input'+key);
            if(elementDiv.value){
                dataAccount[key.toLowerCase()]= elementDiv.value;
            }else{
                someNull=true;
            }
        }
    );
    return someNull?null:dataAccount;
}