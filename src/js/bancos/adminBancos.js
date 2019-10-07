function creacionBancos(){
    const dataUser = validacionBancos();
    if(dataUser!=null){
        console.log(dataUser);
        socket.emit('obtener-bancos', null);
        socket.emit('crear-banco', dataUser);
    }else{
        alert('Por Favor Complete Todos Los Campos');
    }
}

function validacionBancos(){
    let arrayKey = ['Nombre','Cantidad','Total','Estado'];
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