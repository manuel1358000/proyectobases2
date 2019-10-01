function emitCreationUser(){
    const dataUser = validationFormNewUser();
    if(dataUser!=null){
        console.log(dataUser);
        socket.emit('get-all-users',null);
        socket.emit('create-new-user', dataUser);
    }else{
        alert('Por Favor Complete Todos Los Campos');
    }
}

function validationFormNewUser(){
    let arrayKey = ['Nombres','Apellidos','Fecha_Nac','DPI','Direccion','Usuario','Password'];
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
