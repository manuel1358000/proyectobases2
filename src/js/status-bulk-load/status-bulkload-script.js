var _dataFileJSON = [];
var _checksExtern = false;
var _storage={}
var header='';
var isOkGrabador=false;
var isOutForOther=false;
async function loadBulkLoadOwnChecks(dataFile)  {
    var separator =',';
    const {content,option_bulkLoad,filename} = dataFile;
    if(option_bulkLoad=='Archivos Conciliacion OUT' || option_bulkLoad=='Archivos Conciliados IN[OK]'){
        if(option_bulkLoad=='Archivos Conciliacion OUT'){
            isOutForOther=true;
        }
        _storage = dataFile;
        _checksExtern=true;
        separator='|';
        header=filename;
        //return loadBulkLoadExternChecks();
    }
    var htmlx="";
    var allLines=content.split('\n');
    
    allLines.forEach( (line,ii) => {
        
        if (line.trim()!=""){
            var ds=line.split(separator);
            htmlx+='<tr>';
            htmlx+='<th scope="row">'+(ii+1)+'</th>';
            var objN={};
            objN['index']=(ii+1);
             ds.forEach(
                 (item,ij)=>{
                    try {
                        if(_checksExtern){
                            insertDatainJSON2(item,ij,objN);  
                        }else{
                            insertDatainJSON(item,ij,objN);
                        }
                    } catch (error) {
                        console.log(error);
                    }
                    
                    htmlx+='<td>'+item+'</td>';
                }
            );
            htmlx+='<td>'+
                        '<div class="spinner" style="display:none;" id="_spinnerBulkLoad'+(ii+1)+'">'+
                            '<div class="bounce1"></div>'+
                            '<div class="bounce2"></div>'+
                            '<div class="bounce3"></div>'+
                        '</div>'+
                        '<div style="display:none;" id="_transactionItem'+(ii+1)+'">'+
                        '</div>'+
                    '</td>';
            htmlx+='</tr>';
            _dataFileJSON.push(objN);
        }
    });
    document.getElementById("_bodyBulkLoadTable").innerHTML=htmlx;
    $(document).ready( function () {
        $('#_tableBulkLoad').DataTable(
            {
                "scrollY":$(window).height()/2,
                "scrollCollapse": true,
                "paging":false
            }
        );
    } );
}

function loadBulkLoadExternChecks(content){
    initRecorder(content);
}

function insertDatainJSON(item,ii,objN){
    switch(ii){
        case 0:
                objN['p_usuario']=item;
            break;
        case 1:
                objN['p_agencia']=item;
            break;
        case 2:
                objN['p_cuenta_destino']=item;
            break;
        case 3:
                objN['p_cuenta_cheque']=item;
            break;
        case 4:
                objN['p_banco_actual']=item;
            break;
        case 5:
                objN['p_banco_cheque']=item;
            break;
        case 6:
                objN['p_numero_cheque']=item;
            break;
        case 7:
                objN['p_fecha_cheque']=item;
            break;
        case 8:
                objN['p_monto_cheque']=item;
            break;    
    }
}

function insertDatainJSON2(item,ii,objN){
    switch(ii){
        case 0:
                objN['p_banco']=item;
            break;
        case 1:
                objN['p_referencia']=item;
            break;
        case 2:
                objN['p_cuenta']=item;
            break;
        case 3:
                objN['p_cheque']=item;
            break;
        case 4:
                objN['p_monto']=item;
            break;
        case 5:
                objN['p_estado']=item;
            break; 
    }
}

function _recordInOKinTemp(){
    if(!isOutForOther){
        _dataFileJSON.map(it=>{
            var idName="_spinnerBulkLoad"+(it.index);
            document.getElementById(idName).style.display="inline-block";
            try {
                socket.emit('execute-bulk-load-in-tmp',it);
            } catch (error) {
                console.log(error);
            }
        });
    }else{
        _dataFileJSON.map(it=>{
            var idName="_spinnerBulkLoad"+(it.index);
            document.getElementById(idName).style.display="inline-block";
            try {
                socket.emit('execute-bulk-load-out-tmp',{...it,p_banco_destino:10});
            } catch (error) {
                console.log(error);
            }
        });
    }
} 

function startBulkLoad(){
    _dataFileJSON.map(it=>{
        console.log(it);
        var idName="_spinnerBulkLoad"+(it.index);
        try {
            document.getElementById(idName).style.display="inline-block";
            if(_checksExtern){
                //socket.emit('execute-bulk-load-in',it);
            }else{
                socket.emit('execute-bulk-load',it);
            }
            
        } catch (error) {
            console.log(error);
        }
    });
}

function startOperator(){
    if(isOkGrabador){
        _dataFileJSON.map(it=>{
            var _transactionItem = document.getElementById("_transactionItem"+(it.index));
            _transactionItem.style.display="none";
            _transactionItem.innerText='';

            var idName="_spinnerBulkLoad"+(it.index);
            try {
                document.getElementById(idName).style.display="inline-block";
                socket.emit('execute-bulk-load-in-tmp',{...it,operando:true});     
            } catch (error) {
                console.log(error);
            }
        }); 
    }
}

function startRecorder(){
    const {content} = _storage;
    if(!_checksExtern) return ;
    
    try {
        document.getElementById('_spinnerWaitRecorder').style.display='block';
        setTimeout(() => {
            initRecorder(content);
            document.getElementById('_spinnerWaitRecorder').style.display='none';
            document.getElementById('_buttonStartRecorder').disabled=true;
            document.getElementById('_buttonStartBulkLoad').disabled=false;    
        }, 1000);
        
    } catch (error) {
        alert('Ha Ocurrido un Error en el Grabador:'+error);
        document.getElementById('_spinnerWaitRecorder').style.display='none';
        document.getElementById('_buttonStartRecorder').disabled=false;
        document.getElementById('_buttonStartBulkLoad').disabled=true;
    }
}

function initRecorder(content){
    //First Line Contain Header File
    var lines=content.split('\n');
    var headerFile = header.split('.')[0];//Header
    var structHeader = headerFile.split('_');
    var foundValue = structHeader.length<=4? structHeader[3]:0;
    var foundNoDocuments = structHeader.length>=3? structHeader[2]:0;
    
    if(foundValue && foundNoDocuments){
        //Filter lines
        lines = lines.filter(el=>{  return el != null && el!='' });
        //- VERIFICA QUE LA SUMA TOTAL DE LOS CHEQUES CON EL VALOR DEL ENCABEZADO
        //- VERIFICA EL NUMERO DE CHEQUES ES EL MISMO AL NUMERO DE DOCUMENTOS DEL ENCABEZADO
        socket.emit('recorderVerification',{
            valor:foundValue,
            lines:lines,
            noDocuments: foundNoDocuments
        });
    }
}

function finishedRecorderOperation({result}){
    if(result){
        isOkGrabador=true;
        document.getElementById('_spinnerWaitRecorder').style.display='none';
        document.getElementById('_buttonStartRecorder').disabled=true;
        document.getElementById('_buttonStartBulkLoad').disabled=false;
        setTimeout(() => {  _recordInOKinTemp(); },1000);
    }else{
        alert('NoDocumentos No Concuerda\no Valor No Concuerda Con Suma del Valor de Cheques');
        document.getElementById('_spinnerWaitRecorder').style.display='none';
        document.getElementById('_buttonStartRecorder').disabled=false;
        document.getElementById('_buttonStartBulkLoad').disabled=true;
    }
}