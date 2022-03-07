const express = require('express')
const bodyParser = require('body-parser' ) 
const mysql = require('mysql') 
const { getTranslation } = require('./dboperations')
const { application } = require('express')

const app = express() 
const port = process.env.PORT || 5000 
const FULL_SIZE = 10 // FULL SIZE OF CACHE 
app.use(bodyParser.urlencoded({extended : false}))  

app.use(bodyParser.json()) ; 

const {Translate} = require('@google-cloud/translate').v2;

//MYSQL
const pool = mysql.createPool({
    connectionLimit : 10 , 
    host            : 'localhost' , 
    user            : 'root' , 
    password        : 'root' , 
    database        : 'codeyoung' 
}) 

app.get('/all' , (req, res) => {

    pool.getConnection((err,connection) => {
        if(err) throw err 
        console.log(`connected as id ${connection.threadId}`) 
        connection.query('SELECT * from translations' , (err, rows) => {
            connection.release() 
            if(!err) {
                res.send(rows) 
            }
            else {
                console.log(err) 
            }
        })
    })
})


app.get('/searchText' , (req, res) => {

    pool.getConnection((err,connection) => {
        if(err) throw err 
        console.log(`connected as id ${connection.threadId}`) 
        // const data = req.params.Data 
        console.log(req.query.From , req.query.To , req.query.Text) 
        flag  = false 
        connection.query(`SELECT * from translations as t WHERE t.From = "${req.query.From}" AND t.To = "${req.query.To}"  AND t.Text = "${req.query.Text}"  `, (err, rows) => {
            if(!err) {
                if(rows.length > 0 ) {
                    res.send("Translation : " + rows[0].Translation)  
                    flag = true 
                    
                   
                }
            }
            else {
                console.log(err) 
            }
        })
        if(!flag) {
            const tt = "HELLLL"
            connection.query(`SELECT COUNT(*) from translations as t  `, (err, rows) => {
                 
                if(!err) {
                    const count = rows[0] 
                    if(count == FULL_SIZE){
                        connection.query(`DELETE FROM translations  WHERE 'S.No' = (SELECT x.id
                                                FROM (SELECT MIN(t.'S.No') AS id 
                                                        FROM translations t) x) `, (err, rows) => {
                            
                        
                    })
                    }
                    
                    console.log("INSERT INTO translations (\`From\`, \`To\`, \`Text\`, \`Translation\`) VALUES (\"${req.query.From}\" , \"${req.query.To}\" , \"${req.query.Text}\" , Translation = \"${tt}\" ) ")
                    connection.query( `INSERT INTO translations (\`From\`, \`To\`, \`Text\`, \`Translation\`) VALUES ("${req.query.From}" , "${req.query.To}" , "${req.query.Text}" , Translation = "${tt}" ) ` , (err, rows) => {
                        
                        if(!err) {
                            res.send("Translation : " + tt)  
                        }
                        else {
                            console.log( err) 
                        }
                    })
                    
                }
                else {
                    console.log(err) 
                }
            })
        }
    })
})
// getTranslation(from , to , text) {
//     app.post('https://translation.googleapis.com/language/translate/v2' , (req, res) => {
//         pool.getConnection((err,connection) => {
//             if(err) throw err 
//             console.log(`connected as id ${connection.threadId}`) 
//             const params = req.body
//             connection.query( `INSERT INTO translations SET ?`,params , (err, rows) => {
//                 connection.release() 
//                 if(!err) {
//                     res.send(rows) 
//                 }
//                 else {
//                     console.log( err) 
//                 }
//             })
//         })
//     }) 
// }

app.post('/addToCache' , (req, res) => {

    pool.getConnection((err,connection) => {
        if(err) throw err 
        console.log(`connected as id ${connection.threadId}`) 
        const params = req.body
        connection.query( `INSERT INTO translations SET ?`,params , (err, rows) => {
            connection.release() 
            if(!err) {
                res.send(rows) 
            }
            else {
                console.log( err) 
            }
        })
    })
})




//Listen on env port 5000 
app.listen(port , () => console.log(`Listen on port  : ${port}`)) 
