let conexion;
var oracledb = require('oracledb');
function consulta(query){
	conexion=oracledb.getConnection(
	{
    	user          : "systema",
    	password      : "bases2",
    	connectString : "localhost/xe"
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