function solicitarChequera(){
	var id_cuenta=document.getElementById('id_cuenta').value;
	let now=new Date();
	let estado='activa';
	//tenemos que ir a traer el ultimo cheque que tenga la persona
	let ultimo_cheque=10;
	if(id_cuenta){

	}
	var data={
		cuenta:parseInt(id_cuenta),
		no_cheques:10,
		fecha_emision:now,
		estado:estado,
		ultimo_cheque:ultimo_cheque
	};
	socket.emit('crear_chequera',data);



}