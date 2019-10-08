function cargarAgencias(data){
    var html='';
    data.map((item,count)=>{
        html+='<tr>'
        html+='<th scope="row">'+(count+1)+'</th>'
        html+='<td>'+item.DIRECCION+'</td>'
        html+='<td>'+item.FECHA_APERTURA+'</td>'
        html+='<td>'+item.BANCO_COD_LOTE+'</td>'
        html+='<td>'+item.NOMBRE+'</td>'
        html+='<td><button type="button"  class="btn btn-warning btn-sm"  onclick="location.href=\'/agencias/editar/'+item.COD_AGENCIA+'\';" >Editar</button><a> </a><button type="button" class="btn btn-danger btn-sm" onclick="borrarAgencia(\''+item.COD_AGENCIA+'\')">Eliminar</button></td>'
        
        html+='</tr>'
    });
    document.getElementById('tablaAgencia').innerHTML=html;
}