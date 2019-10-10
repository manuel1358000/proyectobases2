var socket = io.connect('192.168.43.202:3000', { 'forceNew': true });

//mensajes de error
socket.on('messages', function(data) {
  console.log(data);
});

//mostrar bancos en lista
socket.on('enviar-bancos',function(data){
  cargarBancos(data);
});

//mostrar info de banco para editar
socket.on('mandar-datos-banco',function(data){
  mostrarBanco(data);
});