function cargarAgencias(data){
    var html='';
    data.map((item,count)=>{
        html+='<tr>'
        html+='<th scope="row">'+(count+1)+'</th>'
        html+='<td>'+item.DIRECCION+'</td>'
        html+='<td>'+item.FECHA_AGENCIA+'</td>'
        html+='<td>'+item.BANCO_COD_LOTE+'</td>'
        //html+='<td><button type="button"  class="btn btn-warning btn-sm">Editar</button><a> </a><button type="button" class="btn btn-danger btn-sm" onclick="deleteClient(\''+item.USUARIO+'\',\''+item.COD_CLIENTE+'\')">Eliminar</button></td>'
        
        html+='</tr>'
    });
    document.getElementById('tablaAgencia').innerHTML=html;
}   