let conexion;
var oracledb = require('oracledb');
function consulta(query){
	conexion=oracledb.getConnection(
	{
    	user          : "system",
    	password      : "Alexandria.2601",
    	connectString : "localhost/XE"
  	},
  	function(err, connection){
    if (err) { console.error(err); return; }
    	connection.execute(
      		query,
      		function(err, result){
        		if (err) { console.error(err); return; }
        			console.log(result.rows);
      		});
  	});
}

module.exports.consulta = consulta;