function loadSelectForGenerator({data}){
    // get reference to select element
    var sel = document.getElementById('_selectBank');
    data.forEach(
        ({BANCO})=>{
            // create new option element
            var opt = document.createElement('option');
            // create text node to add to option element (opt)
            opt.appendChild( document.createTextNode('BANCO '+BANCO) );
            // set value property of opt
            opt.value = BANCO; 
            // add opt to end of select box (sel)
            sel.appendChild(opt);
        }
    );
}

function generarFileOUT(){
    console.log( );
    socket.emit('generate-out-file-bank',{id:document.getElementById("_selectBank").value});
    //document.location.href = '/downloadOut'
}