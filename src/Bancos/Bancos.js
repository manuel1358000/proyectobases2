const express = require("express");
const app = express();
const path = require('path');
var request=require('request');
var conexion=require('./src/js/conexiondb.js')

//Pagina principal
app.get('/Bancos', function (req, res) {
	//conexion.consulta('select * from help');
    res.sendFile(path.join(__dirname+'/src/Bancos/Principal.html'));
});

//Creacion
app.route('/Bancos/Ingreso').get(function(req,res){
    res.sendFile(__dirname+'/src/Bancos/creacion.html');
});

//Eliminacion


//Modificacion