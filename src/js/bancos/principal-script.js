function cargarBancos(data){
    var html='';
    data.map((item,count)=>{
        html+='<tr>'
        html+='<th scope="row">'+(count+1)+'</th>'
        html+='<td>'+item.FECHA+'</td>'
        html+='<td>'+item.CANTIDAD_DOC+'</td>'
        html+='<td>'+item.TOTAL+'</td>'
        html+='<td>'+item.ESTADO+'</td>'
        html+='<td>'+item.NOMBRE+'</td>'
        html+='<td><button type="button"  class="btn btn-warning btn-sm" onclick="location.href=\'/bancos/editar/'+item.COD_LOTE+'\';" > Editar</button> <a> </a><button type="button" class="btn btn-danger btn-sm" onclick="eliminarBanco(\''+item.COD_LOTE+'\')">Eliminar</button></td>'
        html+='</tr>'
    });
    document.getElementById('tablaBancos').innerHTML=html;
}   