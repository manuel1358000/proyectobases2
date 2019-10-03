var socket = io.connect('http://localhost:3000', { 'forceNew': true });

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
  alert(data.message);
});

socket.on('redirect-page',function(data){
  window.location.href = data.url;
});