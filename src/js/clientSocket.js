var socket = io.connect('192.168.43.202:3000', { 'forceNew': true });

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

