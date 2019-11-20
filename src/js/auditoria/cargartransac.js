//funcion que agrega todas las transacciones
//transacciones por banco
function agregarTransacciones(){
  var idbanco = document.getElementById("inputbanco");
	var banco;
	if(idbanco.options[idbanco.selectedIndex]==null){
		banco==null;
	}else{
		banco = idbanco.options[idbanco.selectedIndex].value;
    }
    
  var tabla_trans=document.getElementById("tabla_transac");
  var info_tabla='';
  
	socket.emit('transacciones',banco);
    socket.on('listatrans',function(data){
		for(var i=0;i<data.length;i++){
            info_tabla+='<tr>';
            info_tabla+='<th>'+data[i].COD_TRANSACCION+'</th>';
            info_tabla+='<th>'+data[i].FECHA+'</th>';
            info_tabla+='<th>'+data[i].TIPO+'</th>';
            info_tabla+='<th>'+data[i].NATURALEZA+'</th>';
            info_tabla+='<th>'+data[i].SALDO_INICIAL+'</th>';
            info_tabla+='<th>'+data[i].VALOR+'</th>';
            info_tabla+='<th>'+data[i].SALDO_FINAL+'</th>';
            info_tabla+='<th>'+data[i].AUTORIZACION+'</th>';
            info_tabla+='<th>'+data[i].RECHAZO+'</th>';
            info_tabla+='<th>'+data[i].RAZON_RECHAZO+'</th>';
            info_tabla+='<th>'+data[i].DOCUMENTO+'</th>';
            info_tabla+='<th>'+data[i].NOMBRE+'</th>';
            info_tabla+='<th>'+data[i].USUARIO+'</th>';
            info_tabla+='<th>'+data[i].CUENTA_COD_CUENTA+'</th>';
            info_tabla+='</tr>';
		}	
		tabla_trans.innerHTML=info_tabla;
	});
}

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

//transacciones por fecha
function agregar_trans_fecha(){
  //obtengo fecha
  var elementoFecha = document.getElementById("_inputFecha_Nac");
  var fecha = elementoFecha.value;

  //tabla
  var tabla_trans=document.getElementById("tabla_transac");
  var info_tabla='';
  
  //mando a pedir la info
  socket.emit('transacciones-fecha',fecha);
    socket.on('listatrans-fecha',function(data){
		for(var i=0;i<data.length;i++){
            info_tabla+='<tr>';
            info_tabla+='<th>'+data[i].COD_TRANSACCION+'</th>';
            info_tabla+='<th>'+data[i].FECHA+'</th>';
            info_tabla+='<th>'+data[i].TIPO+'</th>';
            info_tabla+='<th>'+data[i].NATURALEZA+'</th>';
            info_tabla+='<th>'+data[i].SALDO_INICIAL+'</th>';
            info_tabla+='<th>'+data[i].VALOR+'</th>';
            info_tabla+='<th>'+data[i].SALDO_FINAL+'</th>';
            info_tabla+='<th>'+data[i].AUTORIZACION+'</th>';
            info_tabla+='<th>'+data[i].RECHAZO+'</th>';
            info_tabla+='<th>'+data[i].RAZON_RECHAZO+'</th>';
            info_tabla+='<th>'+data[i].DOCUMENTO+'</th>';
            info_tabla+='<th>'+data[i].NOMBRE+'</th>';
            info_tabla+='<th>'+data[i].USUARIO+'</th>';
            info_tabla+='<th>'+data[i].CUENTA_COD_CUENTA+'</th>';
            info_tabla+='</tr>';
		}	
		tabla_trans.innerHTML=info_tabla;
	});
}

//transacciones por numero de cuenta
function agregar_trans_cuenta(){
  //obtengo cuenta
  var elementoCuenta = document.getElementById("_inputCuenta");
  var cuenta = elementoCuenta.value;

  //tabla
  var tabla_trans=document.getElementById("tabla_transac");
  var info_tabla='';
  
  //mando a pedir la info
  socket.emit('transacciones-cuenta',cuenta);
    socket.on('listatrans-cuenta',function(data){
		for(var i=0;i<data.length;i++){
            info_tabla+='<tr>';
            info_tabla+='<th>'+data[i].COD_TRANSACCION+'</th>';
            info_tabla+='<th>'+data[i].FECHA+'</th>';
            info_tabla+='<th>'+data[i].TIPO+'</th>';
            info_tabla+='<th>'+data[i].NATURALEZA+'</th>';
            info_tabla+='<th>'+data[i].SALDO_INICIAL+'</th>';
            info_tabla+='<th>'+data[i].VALOR+'</th>';
            info_tabla+='<th>'+data[i].SALDO_FINAL+'</th>';
            info_tabla+='<th>'+data[i].AUTORIZACION+'</th>';
            info_tabla+='<th>'+data[i].RECHAZO+'</th>';
            info_tabla+='<th>'+data[i].RAZON_RECHAZO+'</th>';
            info_tabla+='<th>'+data[i].DOCUMENTO+'</th>';
            info_tabla+='<th>'+data[i].NOMBRE+'</th>';
            info_tabla+='<th>'+data[i].USUARIO+'</th>';
            info_tabla+='<th>'+data[i].CUENTA_COD_CUENTA+'</th>';
            info_tabla+='</tr>';
		}	
		tabla_trans.innerHTML=info_tabla;
	});
}

agregarTransacciones();
agregarBancos();