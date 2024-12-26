const mysql = require('mysql2')
require('dotenv').config();

const pool = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME,
})

pool.connect((err) => {
    console.log(err)
})
module.exports = pool.promise()