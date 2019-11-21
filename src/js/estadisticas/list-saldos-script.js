
function consulta1(){
    socket.emit('list-saldos-accounts',null);
}

function consulta2(){
    socket.emit('clients-greater-deposits',{});
}

function consulta3(){
    socket.emit('clients-greater-checks',{});
}

function consulta4(){
    socket .emit('clients-without-deposit',null);       
}

function _loadTableData(metaData,rows,information){
    document.getElementById('bar-chart').style.display='none';
    document.getElementById('_tableInformation').style.display='inline';
    document.getElementById('_tableConsults').style.display='inline';
    
    metaData=metaData.map(el=>el.name);
    var str_htmlHead=metaData.map(el=> '<th scope="col">'+el+'</th>');
    var str_htmlBody=rows.map(row=>{
        return '<tr>\n'+Object.values(row).map(el=>'<td>\n'+el+'\n</td>').join("\n")+'</tr>\n';
    }).join("\n");
    document.getElementById('_head_TableStatics').innerHTML=str_htmlHead;
    document.getElementById('_body_TableStatics').innerHTML=str_htmlBody;
    document.getElementById('_tableInformation').innerText=information;
}

function _loadBarData(row){
    document.getElementById('bar-chart').style.display='inline';
    document.getElementById('_tableInformation').style.display='none';
    document.getElementById('_tableConsults').style.display='none';
    
    new Chart(document.getElementById("bar-chart"), {
        type: 'bar',
        data: {
          labels: Object.keys(row),
          datasets: [
            {
              //label: "Datos de Saldos de Todos las Cuentas",
              backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f"],
              data: Object.values(row)
            }
          ]
        },
        options: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Datos de Saldos de Todas las Cuentas',
            fontSize:24
          }
        }
    });
}