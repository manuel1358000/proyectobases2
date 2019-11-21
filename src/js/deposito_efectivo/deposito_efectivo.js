function realizarDepositoEfectivo(){
    if(confirm('Desea realizar la transferencia')){
        var id_usuario=document.getElementById('id_usuario').value;
        var id_agencia=document.getElementById('id_agencia').value;
        var id_cuenta=document.getElementById('id_cuenta').value;
        var monto=document.getElementById('id_monto').value;
        var transferencia={
            agencia:id_agencia,//id de la agencia donde se realiza la transaccion
            cuenta:id_cuenta,//cuenta a donde se va a acreditar el monto
            monto:monto,//monto total de la transaccion
            usuario:id_usuario,//empleado que realiza la transaccion
        };
        socket.emit('realizar_deposito_efectivo',transferencia);
    }
}