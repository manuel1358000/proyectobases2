//-----------------------------CREATE
function emitCreationUser(){
    const dataUser = validationFormNewUser();
    if(dataUser!=null){
        var elementDiv=document.getElementById('_inputRepetirPassword');
        if(elementDiv.value!=dataUser.password){
            alert('Contraseñas NO COINCIDEN');
            dataUser=null;
        }else{
            console.log(dataUser);
            socket.emit('create-new-user', dataUser);
        }
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

//-----------------------------EDIT
function loadFormEdit(){
    socket.emit('get-user',null);
}
function emitEditUser(){
    const dataUser = validationFormNewUser();
    if(dataUser!=null){
        console.log(dataUser);
        socket.emit('edit-user', dataUser);
    }else{
        alert('Por Favor Complete Todos Los Campos');
    }
}
function loadClient(data){
    let arrayKey = ['Nombres','Apellidos','Fecha_Nac','DPI','Direccion','Usuario','Password'];
    let arrayKeyRow = ['NOMBRES','APELLIDOS','FECHA_NACIMIENTO','DPI','DIRECCION','USUARIO','PASSWORD'];
    arrayKey.forEach(
        (key,count)=>{
            var elementDiv=document.getElementById('_input'+key);
            if(elementDiv!=null){
                elementDiv.value=data[arrayKeyRow[count]];
            }
        }
    );
}   
