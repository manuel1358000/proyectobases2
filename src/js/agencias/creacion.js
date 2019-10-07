//Para el select del banco al que pertenece la agencia
function agregarBancos(){
	var bancos=document.getElementById('inputbanco');
	var opciones='';
	socket.emit('bancos',null);
	socket.on('listabancos', function(data) {
		for(var i=0;i<data.length;i++){
			opciones+='<option value="'+data[i].COD_LOTE+'">'+data[i].NOMBRE+'</option>';
		}
		bancos.insertAdjacentHTML('beforeend',opciones);
	});
}

agregarBancos();