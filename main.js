const denodeify = require('denodeify')
const express = require('express')
const PDFDocument = require('pdfkit')
const mysql = require('mysql')

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // db created through mysqld --initialize-insecure
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
  res.send(`<form action="/firstName">
    <input type="text" name="firstName" value="user"></input>
    <input type="submit" value="submit"></input>
  </form>`)
})

conQueryp = denodeify(con.query).bind(con)
app.get('/firstName', (req, res) => {
  console.log('req.query:', req.query)
  const sql = `SELECT * FROM user WHERE firstName = "${req.query.firstName}"`
  conQueryp(sql)
  .then( result => {
    if (result.length === 0) return Promise.reject()
    return result[0]
  })
  .then( user => {
    console.log('got user form db:', user)
    return createPdf(user)
  })
  .then( pdfBuff => {
    console.log('pdf created:', pdfBuff)
    const sql = `UPDATE user SET ? WHERE firstName = "${req.query.firstName}"`
    return conQueryp(sql, {pdf: pdfBuff})
  })
  .then( result => {
    console.log('pdf updated in db:', result)
    res.send('true')
  })
  .catch( err => {
    res.send('false')
  })
})

function createPdf (user) {
  return new Promise(function executor (resolve, reject) {
    const doc = new PDFDocument
     
    doc.text(user.firstName + ' ' + user.lastName, 100, 100)
    if (user.image) doc.image(user.image)
    doc.end()

    const buffs = []
    doc.on('data', data => buffs.push(data)) 
    doc.on('end', () => {
      //require('fs').writeFileSync('file.pdf', Buffer.concat(buffs))
      resolve(Buffer.concat(buffs))
    })
  })
}