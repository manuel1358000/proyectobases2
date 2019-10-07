var currenDataAccountUser$=null;
function loadFormEditAccount(){
    socket.emit('get-account-client',null);
}
function loadAccountClient(data){
    try {
        currenDataAccountUser$=data;
        document.getElementById('_h2UserAccount').innerHTML="Usuario:"+data.USUARIO;  
        document.getElementById('_inputEstado').value=data.ESTADO;  
    } catch (error) {
        
    }
    
    console.log(data);
}

function editAccountClient(){
    var selectElement= document.getElementById('_inputEstado');
    if(selectElement.value){
        socket.emit('edit-account-client',{'cod_cuentax':parseInt(currenDataAccountUser$.COD_CUENTA),'estadox':selectElement.value});
    }
}