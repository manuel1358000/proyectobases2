var socket = io.connect('localhost:3000', { 'forceNew': true });

socket.on('messages', function(data) {
  console.log(data);
});

socket.on('send_receive-all-users',function(data){
  loadClients(data);
});
socket.on('send_receive-user',function(data){
  loadClient(data);
});

socket.on('message-action',function(data){
  console.log(data.message);
  alert(data.message);
});

socket.on('redirect-page',function(data){
  window.location.href = data.url;
});

socket.on('send_receive-all-accounts-user',function(data){
  loadAccountsClient(data);
});

socket.on('send_receive-account-client',function(data){
  loadAccountClient(data);
});

//enviar-agencia
socket.on('enviar-agencia',function(data){
  cargarAgencias(data);
});
//editar agencias
socket.on('mandar-datos-agencia',function(data){
  mostrarAgencia(data);
});

//mostrar bancos en lista
socket.on('enviar-bancos',function(data){
  cargarBancos(data);
});
//mostrar info de banco para editar
socket.on('mandar-datos-banco',function(data){
  mostrarBanco(data);
});
socket.on('response-bulk-load-item',function({message,failed,num}){
  var _transactionItem = document.getElementById("_transactionItem"+(num));
  _transactionItem.style.display="inline-block";
  if(failed){
    message=errorTypes[message];
  }
  _transactionItem.innerText=message;
  document.getElementById("_spinnerBulkLoad"+(num)).style.display="none";
});
//obtiene los datos del ultimo archivo cargado (Cheques del Banco  Nuestro)
socket.on('receive-data-from-last-file',function(data){
  loadBulkLoadOwnChecks(data);
});
//Obtiene la Verificacion del Server del Grabador
socket.on('receive-verification-recorder-server',function(data){
  finishedRecorderOperation(data);
});

const errorTypes={
  '20010':'FECHA INVALIDA',
  '20020':'CHEQUE NO PERTENECE A LA CUENTA',
  '20030':'CHEQUE PAGADO/EXTRAVIADO/CANCELADO',
  '20040':'CUENTA CHEQUE SIN FONDOS'
}