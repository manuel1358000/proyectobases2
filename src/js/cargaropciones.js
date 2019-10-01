function agregarBancos(){
	var bancos=document.getElementById('inputbanco');
	conexionnueva.consulta('select * from BANCOS');
	bancos.insertAdjacentHTML('beforeend','<option>manuel</option><option>antonio</option>');
}
function actualizarAgencias(){
	var idbanco = document.getElementById("inputbanco");
	var banco = idbanco.options[idbanco.selectedIndex].value;
	agregarAgencias(banco);
}
function agregarAgencias(banco_seleccionado){
	var agencia=document.getElementById('inputagencia');
	var opciones_agencias='<option>'+banco_seleccionado+'</option><option>agencia2</option>';
	agencia.innerHTML=opciones_agencias;
}

function saludar(){
	alert('soy el boton de filtrar');
}

agregarBancos();

