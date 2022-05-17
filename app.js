const express = require('express');
const XLSX = require('xlsx');
require('./config/mongoose');

const User = require('./models/User.model');
const File = require('./models/File.model')

const app = express();

app.get('/', (req, res) => {
  res.send('Welcome');
});

// app.get('/add/user', async(req, res) => {
//   try {
//     const user = new User({
//       name: 'Rahul',
//       email: 'admin@gmail.com',
//       password: 'admin'
//     })
  
//     await user.save();
//     res.status(200).json({message: 'User saved successfully'});
//   } catch(err) {
//     res.status(500).json({err: err.message});
//   }
// })

// app.get('/add/file', async(req, res) => {
//   try {
//     // const email = req.query.email;
//     const user = await User.findOne({email: 'admin@gmail.com'});

//     const file = new File({
//       email: user.email,
//       userId: user._id,
//       file: ''
//     });

//     await file.save();
//     res.status(200).json({message: 'File saved successfully'});
//   } catch(err) {
//     res.status(500).json({err: err.message});
//   }
// })

app.get('/auth', async (req, res) => {
  try {
    const base64Data = req.get('Authorization');
    if(!base64Data || !base64Data.length) {
      return res.status(401).send('No credentials provided');
    }
    const buffer = Buffer.from(base64Data?.split(' ')[1], 'base64');
    const userData = buffer.toString('utf8');
    const [email, password] = userData.split(':');

    const user = await User.findOne({email});
    if(!user || user.password !== password) {
      return res.status(401).send('Invalid credentials');
    }
    res.status(200).send('User logged in');
  } catch(err) {
    res.status(500).send('Unable to Login');
  }
})

app.get('/files', (req, res) => {
  res.send(['test1', 'test2', 'test3'])
})

app.get('/:clientId', (req, res) => {
  const clientId = '12345' || req.params.clientId;
  const accessToken = '12345' || req.query.access_token;
  if(!clientId || !accessToken) {
    res.send({})
  }
  const filePath = `${__dirname}/files/${clientId}-${accessToken}.xlsx`;
  const workbook = XLSX.readFile(filePath, {cellDates:true});
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  res.send(JSON.stringify(data));
});

app.listen(3000, () => console.log('Server running on port 3000'));