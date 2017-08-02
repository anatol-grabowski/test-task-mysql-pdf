const express = require('express')
const mysql = require('mysql')
const userToPdf = require('..')

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'mydb'
})

con.connect(err => {
  if (err) throw err
  console.log('connected to db')
})

const app = express()
app.listen(80, () => {
  console.log('listening')
})

app.get('/', (req, res) => {
  res.send(`<form action="/pdfByFirstName">
    <input type="text" name="firstName" value="user"></input>
    <input type="submit" value="submit"></input>
  </form>`)
})

app.get('/pdfByFirstName', userToPdf(con))