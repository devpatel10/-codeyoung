var config = require('./dbconfig') ; 
const sql = require('mysql') ; 

async function getTranslation() {
    try{
        let pool = await sql.connect(config) ; 
        let translation = await pool.request().query("SELECT * from codeyoung.translations") ; 
        return translation.recordset ; 
    }
    catch(error){
        console.log(error) ; 
    }
}

module.exports = {
    getTranslation : getTranslation
}