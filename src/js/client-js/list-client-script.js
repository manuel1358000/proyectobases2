function loadClients(data){
    var html='';
    data.map((item,count)=>{
        html+='<tr>'
        html+='<th scope="row">'+(count+1)+'</th>'
        html+='<td>'+item.NOMBRES+'</td>'
        html+='<td>'+item.APELLIDOS+'</td>'
        html+='<td>'+item.USUARIO+'</td>'
        html+='<td>'+item.DIRECCION+'</td>'
        html+='<td>'+item.FECHA_NACIMIENTO+'</td>'
        html+='<td><button type="button"  class="btn btn-warning btn-sm" onclick="location.href=\'/clients/'+item.COD_CLIENTE+'\';">Editar</button><a> </a><button type="button" class="btn btn-danger btn-sm" onclick="deleteClient(\''+item.USUARIO+'\',\''+item.COD_CLIENTE+'\')">Eliminar</button></td>'
        
        html+='</tr>'
    });
    document.getElementById('_tableClientsBody').innerHTML=html;
}   

function deleteClient(user,cod_cliente){
    if (confirm("Confirma la ELIMINACION de USUARIO: ["+user+"]")) {
        socket.emit('delete-user',{'cod_clientex':cod_cliente});
        alert('eliminado exitosamente');
        window.location.reload();
    }
}