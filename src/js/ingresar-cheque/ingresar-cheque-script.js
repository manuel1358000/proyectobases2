
function  pagar_ingresarCheque(){
    let _object = {
        p_usuario:'',
        p_agencia:'',
        p_cuenta_destino:'',
        p_cuenta_cheque:'',
        p_banco_actual:'',
        p_banco_cheque:'',
        p_numero_cheque:'',
        p_fecha_cheque:'',
        p_monto_cheque:''
    };

    Object.keys(_object).map(el=> {
        if(el=='p_monto_cheque'){
            _object[el]=parseFloat(document.getElementById(el).value);
        }else{
            _object[el]=parseInt(document.getElementById(el).value);
        }
    });
    var findNull=Object.values(_object).filter(el=> el==null||el=='');
    if(findNull){ 
        alert('Llene Todos Los Campos'); 
        return;
    }else{
        socket.emit('execute-insert-check',_object);
    }
    
}
