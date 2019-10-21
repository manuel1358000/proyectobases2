function realizarTransferencia(){
    if(confirm('Desea realizar la transferencia')){
        var cuenta_origen=document.getElementById('id_cuentao').value;
        var cuenta_destino=document.getElementById('id_cuentad').value;
        var monto=document.getElementById('id_monto').value;
        var transferencia={
            cuenta_origen:cuenta_origen,
            cuenta_destino:cuenta_destino,
            monto:monto
        };
        socket.emit('realizar_transferencia',transferencia);
    }
}