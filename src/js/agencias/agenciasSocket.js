var socket = io.connect('192.168.43.202:3000', { 'forceNew': true });

//errores
socket.on('messages', function(data) {
  console.log(data);
});

//mostrar agencias en lista
socket.on('enviar-agencia',function(data){
  cargarAgencias(data);
});

//editar agencias
socket.on('mandar-datos-agencia',function(data){
  mostrarAgencia(data);
});