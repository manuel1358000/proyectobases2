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
        //html+='<td><button type="button"  class="btn btn-warning btn-sm">Editar</button><a> </a><button type="button" class="btn btn-danger btn-sm" onclick="deleteClient(\''+item.USUARIO+'\',\''+item.COD_CLIENTE+'\')">Eliminar</button></td>'
        
        html+='</tr>'
    });
    document.getElementById('tablaBancos').innerHTML=html;
}   