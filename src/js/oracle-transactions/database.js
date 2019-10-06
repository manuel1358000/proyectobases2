const oracledb = require('oracledb');
async function initialize() {
  const pool = await oracledb.createPool({
    user          : "system",
    password      : "bases2",
    //password      : "Alexandria.2601",
    connectString : "localhost/XE"
  });
}
async function close() {
  await oracledb.getPool().close();
}

function simpleExecute(statement, binds = [], opts = {}) {
  return new Promise(async (resolve, reject) => {
    let conn;
 
    opts.outFormat = oracledb.OBJECT;
    opts.autoCommit = true;
 
    try {
      conn = await oracledb.getConnection();
 
      const result = await conn.execute(statement, binds, opts);
 
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      if (conn) { // conn assignment worked, need to close
        try {
          await conn.close();
        } catch (err) {
          console.log(err);
        }
      }
    }
  });
}
 
module.exports.simpleExecute = simpleExecute;
module.exports.close = close;
module.exports.initialize = initialize;