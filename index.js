const express = require("express");
const app = express();
var request=require('request');

app.get('/', function (req, res) {
    res.send("hola mundo");
});
//servicio que se consume para dar el aviso al piloto redirige al servicio de piloto

app.listen(3000, () => {
 console.log("Servidor en la direccion 127.0.0.1:3000");
});

