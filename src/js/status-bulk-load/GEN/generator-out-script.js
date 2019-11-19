function loadSelectForGenerator(){
    var data=['Banco01','Banco02','Banco04'];
    // get reference to select element
    var sel = document.getElementById('_selectBank');
    data.forEach(
        el=>{
            // create new option element
            var opt = document.createElement('option');
            // create text node to add to option element (opt)
            opt.appendChild( document.createTextNode(el) );
            // set value property of opt
            opt.value = el; 
            // add opt to end of select box (sel)
            sel.appendChild(opt);
        }
    );
}

function generarFileOUT(){
    console.log(document.getElementById("_selectBank").value );
    document.location.href = '/downloadOut'



}