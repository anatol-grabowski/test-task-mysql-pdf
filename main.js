const denodeify = require('denodeify')
const PDFDocument = require('pdfkit')

let conQueryp
function createPdfByFirstName (req, res) {
  /* if express is not used:
  const reqQuery = req.url.replace(/(^[\w\W]*\?)/, '')
    .split('&')
    .map(q => q.split('='))
  const firstName = reqQuery.find(q => q[0] === 'firstName')[1] */
  console.log('req.query:', req.query)
  const firstName = req.query.firstName
  
  const sql = `SELECT * FROM user WHERE firstName = ?`
  conQueryp(sql, [firstName])
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
    const sql = `UPDATE user SET ? WHERE firstName = ?`
    return conQueryp(sql, [{pdf: pdfBuff}, firstName])
  })
  .then( result => {
    console.log('pdf updated in db:', result)
    res.send('true')
  })
  .catch( err => {
    res.send('false')
  })
}

function createPdf (user) {
  return new Promise(function executor (resolve, reject) {
    const doc = new PDFDocument
    doc.text(user.firstName + ' ' + user.lastName, 100, 100)
    if (user.image) doc.image(user.image)
    doc.end()

    const buffs = []
    doc.on('data', data => buffs.push(data)) 
    doc.on('end', () => {
      // require('fs').writeFileSync('file.pdf', Buffer.concat(buffs))
      resolve(Buffer.concat(buffs))
    })
  })
}

module.exports = function (con) {
  conQueryp = denodeify(con.query).bind(con)
  return createPdfByFirstName
}