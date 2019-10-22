function consulta_saldo(){
    var id_cuenta=document.getElementById('id_cuenta').value;
    var tabla_saldos=document.getElementById('tabla_saldos');
    var info_tabla='';
    tabla_saldos.innerHTML='';
    if(id_cuenta!=''){
        socket.emit('consulta_saldo',id_cuenta);
        socket.on('datos_saldo',async function(data){
            for(var i=0;i<data.length;i++){
                info_tabla+='<tr><th>'+id_cuenta+'</th>';
                info_tabla+='<th>'+data[i].SALDO+'</th>';
                info_tabla+='<th>'+data[i].RESERVA+'</th>';
                info_tabla+='<th>'+data[i].DISPONIBLE+'</th>';
            }	
            tabla_saldos.innerHTML=info_tabla;
        });
    }else{
        alert('Ingrese un numero de cuenta');
    }
}