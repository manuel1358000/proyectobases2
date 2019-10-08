//creacion de bancos
function creacionBancos(){
    const dataUser = validacionBancos();
    if(dataUser!=null){
        console.log(dataUser);
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

function validacionBancosEdit(){
    let arrayKey = ['Nombre','Cantidad','Total','Estado','Fecha'];
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

//editar bancos
function cargarEdicion(){
    socket.emit('get-banco',null);
}

//mostrar info de un banco
function mostrarBanco(data){
    let arrayKey = ['Nombre','Cantidad','Fecha','Estado','Total']; //campos html
    let arrayKeyRow = ['NOMBRE','CANTIDAD_DOC','FECHA','ESTADO','TOTAL']; //datos en la tabla
    arrayKey.forEach(
        (key,count)=>{
            var elementDiv=document.getElementById('_input'+key);
            if(elementDiv!=null){
                elementDiv.value=data[arrayKeyRow[count]];
            }
        }
    );
}

//editar la info de los bancos
function edicionBancos(){
    const dataUser = validacionBancosEdit();
    if(dataUser!=null){
        console.log(dataUser);
        socket.emit('editar-banco', dataUser);
    }else{
        alert('Por Favor Complete Todos Los Campos');
    }
}