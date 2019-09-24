const express = require("express");
const app = express();
const path = require('path');
var request=require('request');

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/src/template/index.html'));
});

app.listen(3000, () => {
 console.log("Servidor en la direccion 127.0.0.1:3000");
});

