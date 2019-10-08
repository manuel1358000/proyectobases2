var socket = io.connect('http://localhost:3000', { 'forceNew': true });

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