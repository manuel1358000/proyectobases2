var _dataFileJSON = [];
var _checksExtern = false;
var _storage={}
async function loadBulkLoadOwnChecks(dataFile)  {
    var separator =',';
    const {content,option_bulkLoad} = dataFile;
    if(option_bulkLoad=='Cheques de Externos'){
        _storage = dataFile;
        _checksExtern=true;
        separator='|';
        //return loadBulkLoadExternChecks();
    }
    var htmlx="";
    var allLines=content.split('\n');
    if(_checksExtern){
        allLines.splice(0,1);
    }
    allLines.forEach( (line,ii) => {
        
        if (line.trim()!=""){
            var ds=line.split(separator);
            htmlx+='<tr>';
            htmlx+='<th scope="row">'+(ii+1)+'</th>';
            var objN={};
            objN['index']=ii;
             ds.forEach(
                 (item,ij)=>{
                    try {
                         insertDatainJSON(item,ij,objN);    
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
function startBulkLoad(){
    var numero=0;
    _dataFileJSON.map((it,ii)=>{
        numero++;
        console.log(it);
        var idName="_spinnerBulkLoad"+(ii+1);
        try {
            console.log(numero);
            document.getElementById(idName).style.display="inline-block";
            socket.emit('execute-bulk-load',it);
        } catch (error) {
            console.log(error);
        }
    });
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
    var headerFile = lines.splice(0,1)[0];//Header
    var structHeader = headerFile.split('|');
    console.log(structHeader);
    var foundValue = structHeader.find(el=>{
        return el.toLowerCase().indexOf('valor')!=-1;
    });
    var foundNoDocuments = structHeader.find(el=>{
        return el.toLowerCase().indexOf('nodoc')!=-1;
    });
 
    if(foundValue && foundNoDocuments){
        //Filter lines
        lines = lines.filter(el=>{  return el != null && el!='' });
        //- VERIFICA QUE LA SUMA TOTAL DE LOS CHEQUES CON EL VALOR DEL ENCABEZADO
        //- VERIFICA EL NUMERO DE CHEQUES ES EL MISMO AL NUMERO DE DOCUMENTOS DEL ENCABEZADO
        socket.emit('recorderVerification',{
            valor:(foundValue.split(':'))[1],
            lines:lines,
            noDocuments: (foundNoDocuments.split(':'))[1]
        });
    }
}

function finishedRecorderOperation({result}){
    if(result){
        alert('Verificacion de Grabador Correcta');
        document.getElementById('_spinnerWaitRecorder').style.display='none';
        document.getElementById('_buttonStartRecorder').disabled=true;
        document.getElementById('_buttonStartBulkLoad').disabled=false;
    }else{
        alert('NoDocumentos No Concuerda\no Valor No Concuerda Con Suma del Valor de Cheques');
        document.getElementById('_spinnerWaitRecorder').style.display='none';
        document.getElementById('_buttonStartRecorder').disabled=false;
        document.getElementById('_buttonStartBulkLoad').disabled=true;
    }
}