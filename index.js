const express = require("express");
const app = express();
const path = require('path');
var request=require('request');
var conexion=require('./src/js/conexiondb.js')

app.use(express.static('src')); //Serves resources from public folder

app.get('/', function (req, res) {
	conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/template/index.html'));
});

app.listen(3000, () => {
 console.log("Servidor en la direccion 127.0.0.1:3000");
});