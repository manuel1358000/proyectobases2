function realizarTransferencia(){
    if(confirm('Desea realizar la transferencia')){
        var id_usuario=document.getElementById('id_usuario').value;
        var id_agencia=document.getElementById('id_agencia').value;
        var id_cuenta_origen=document.getElementById('id_cuentao').value;
        var id_cuenta_destino=document.getElementById('id_cuentad').value;
        var monto=document.getElementById('id_monto').value;
        var transferencia={
            agencia:id_agencia,//id de la agencia donde se realiza la transaccion
            cuenta_origen:id_cuenta_origen,//cuenta de donde se va a debitar el monto
            cuenta_destino:id_cuenta_destino,//cuenta a donde se va a acreditar el monto
            monto:monto,//monto total de la transaccion
            usuario:id_usuario,//empleado que realiza la transaccion
        };
        socket.emit('realizar_transferencia',transferencia);
    }
}