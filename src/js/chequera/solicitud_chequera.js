function solicitarChequera(){
	var id_cuenta=document.getElementById('id_cuenta').value;
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