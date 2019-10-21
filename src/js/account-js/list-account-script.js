
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
        html+='<td><button  type="button" onclick="mostrarModal('+item.COD_CUENTA+')" >Solicitar Chequera</button><a> </a><button type="button"  class="btn btn-warning btn-sm" onclick="location.href=\'/clients/'+item.COD_CLIENTE+'/accounts/'+item.COD_CUENTA+'\';">Editar</button><a> </a><button type="button" class="btn btn-danger btn-sm" onclick="deleteAccountUser(\''+item.COD_CLIENTE+'\',\''+item.COD_CUENTA+'\',\''+item.FECHA_APERTURA+'\')">Eliminar</button></td>'
        
        html+='</tr>' 
    });
    document.getElementById('_tableAccountsClientBody').innerHTML=html;
}

function deleteAccountUser(cod_cliente,cod_cuenta,fecha_apertura){
    if (confirm("Confirma la ELIMINACION de la cuenta: ["+cod_cuenta+"]\nAperturada en: "+fecha_apertura)) {
        socket.emit('delete-account-client',{'cod_clientex':cod_cliente,'cod_cuentax':cod_cuenta,'fecha_aperturax':fecha_apertura});
    }
}

function mostrarModal(codcuenta){
    document.getElementById("btnSolicitarChequera").onclick=function() { solicitarChequera(codcuenta); }

    document.getElementById("formSolicitarChequera").style.display='block';
    window.scrollTo(0, 0);
}

function solicitarChequera(idCuenta){
    document.getElementById("formSolicitarChequera").style.display='none';
	var id_cuenta=parseInt(idCuenta);
	var id_numcheque=document.getElementById('id_numcheques').value;
	var ts = new Date();
    var fecha_emision=ts.getFullYear()+'-'+("0" + (ts.getMonth() + 1)).slice(-2)+'-'+("0" + (ts.getDay() + 1)).slice(-2);       
	let estado='activa';
	let ultimo_cheque=parseInt(id_numcheque);
	socket.emit('numero_cheques',{cuenta:id_cuenta});
	socket.on('correlativo', function(data) {
		if(data['CORRELATIVO']!=null){
			ultimo_cheque+=parseInt(data['CORRELATIVO'])
		}
		console.log('Numero Cheques->'+id_numcheque);
		console.log('Fecha_Emision->'+fecha_emision);
		console.log('Estado->'+estado);
		console.log('Ultimo Cheque->'+ultimo_cheque);
		var valores={
			no_cheques:id_numcheque,
			fecha_emision:fecha_emision,
			estado:estado,
			ultimo_cheque:ultimo_cheque,
			cuenta_cod_cuenta:id_cuenta
		};
		socket.emit('solicitar_chequera',valores);
    });
}