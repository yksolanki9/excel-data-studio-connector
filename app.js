const express = require('express');
const XLSX = require('xlsx');

const app = express();

app.get('/', (req, res) => {
  res.send('Welcome');
});

app.get('/:clientId', (req, res) => {
  const clientId = req.params.clientId;
  const accessToken = req.query.access_token;
  if(!clientId || !accessToken) {
    res.send({})
  }
  const filePath = `${__dirname}/files/${clientId}-${accessToken}.xlsx`;
  const workbook = XLSX.readFile(filePath, {cellDates:true});
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  res.send(JSON.stringify(data));
});

app.listen(3000, () => console.log('Server running on port 3000'));