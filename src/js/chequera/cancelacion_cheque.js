function cancelarCheque(){
    var numero_cheque=document.getElementById('id_numcheque').value;
    var numero_chequera=document.getElementById('id_numchequera').value;
    var razon=document.getElementById('id_razon').value;
    var valores={
        no_cheque:numero_cheque,
        no_chequera:numero_chequera,
        razon:razon
    };
    socket.emit('rango_chequera',{chequera:numero_chequera});
    socket.on('rango_cheques', function(data) {
        if(data!=null){
            var inicio=parseInt(data['ULTIMO_CHEQUE'])-parseInt(data['NO_CHEQUES']);
            var fin=parseInt(data['ULTIMO_CHEQUE']);
            if((parseInt(numero_cheque)>=inicio&&parseInt(numero_cheque)<=fin)){
                socket.emit('cancelar_cheque',valores);
                alert('Cheque Cancelado');
            }else{
                alert('El numero de cheque no esta asociado al numero de chequera');
            }
        }else{
            console.log('Data vacio');
        }
	});

    
}