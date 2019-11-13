var _dataFileJSON = [];
async function loadBulkLoadOwnChecks(dataFile)  {
    const {content,option_bulkLoad} = dataFile;
    if(option_bulkLoad=='Cheques de Externos'){
        return loadBulkLoadExternChecks(content);
    }
    var htmlx="";
     content.split('\n').forEach( (line,ii) => {
        if (line.trim()!=""){
            var ds=line.split(',');
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
        $('#_tableBulkLoad').DataTable();
    } );
}

function loadBulkLoadExternChecks(content){
    //First Line Contain Header File
    var lines=content.split('\n');
    var headerFile = lines.splice(0,1);//Header
    //- VERIFICA QUE LA SUMA TOTAL DE LOS CHEQUES CON EL VALOR DEL ENCABEZADO
    lines.forEach(el=>{

    });
    console.log(lines);
    
    //- VERIFICA EL NUMERO DE CHEQUES ES EL MISMO AL NUMERO DE DOCUMENTOS DEL ENCABEZADO

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
    _dataFileJSON.map((it,ii)=>{
        console.log(it);
        var idName="_spinnerBulkLoad"+(ii+1);
        try {
            document.getElementById(idName).style.display="inline-block";
            socket.emit('execute-bulk-load',it);
        } catch (error) {
            console.log(error);
        }
    });
}