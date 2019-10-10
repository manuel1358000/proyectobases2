function loadAccountsClient(data){
    try {
        document.getElementById('_nameUserAccounts').innerHTML="Cuentas del Usuario:"+data[0].USUARIO;    
    } catch (error) {}
    
    var html='';
    data.map((item,count)=>{
        
        html+='<tr>'
        html+='<th scope="row">'+(count+1)+'</th>'
        html+='<td>'+item.COD_CUENTA+'</td>'
        html+='<td>'+item.ESTADO+'</td>'
        html+='<td>'+item.SALDO+'</td>'
        html+='<td>'+item.RESERVA+'</td>'
        html+='<td>'+item.DISPONIBLE+'</td>'
        html+='<td>'+item.FECHA_APERTURA+'</td>'
        html+='<td><button data-account-id="'+item.COD_CUENTA+'" type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="modal_SolicitarChequera">Solicitar Chequera</button><a> </a><button type="button"  class="btn btn-warning btn-sm" onclick="location.href=\'/clients/'+item.COD_CLIENTE+'/accounts/'+item.COD_CUENTA+'\';">Editar</button><a> </a><button type="button" class="btn btn-danger btn-sm" onclick="deleteAccountUser(\''+item.COD_CLIENTE+'\',\''+item.COD_CUENTA+'\',\''+item.FECHA_APERTURA+'\')">Eliminar</button></td>'
        
        html+='</tr>' 
    });
    document.getElementById('_tableAccountsClientBody').innerHTML=html;
}

function deleteAccountUser(cod_cliente,cod_cuenta,fecha_apertura){
    if (confirm("Confirma la ELIMINACION de la cuenta: ["+cod_cuenta+"]\nAperturada en: "+fecha_apertura)) {
        socket.emit('delete-account-client',{'cod_clientex':cod_cliente,'cod_cuentax':cod_cuenta,'fecha_aperturax':fecha_apertura});
    }
}