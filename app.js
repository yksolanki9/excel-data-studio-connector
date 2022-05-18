const express = require('express');
const XLSX = require('xlsx');
const bcrypt = require('bcrypt');
require('./config/mongoose');

const User = require('./models/User.model');
const File = require('./models/File.model')

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index', {data:'Google Data Studio Custom Connector'});
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  try {
    const {name, email, password} = req.body;
    let user = await User.findOne({email});
    if (user) {
      return res.status(401).render('index', {data:'User with email already exists'});
    }
    user = new User({
      name,
      email,
      password
    });

    const hashedPwd = await bcrypt.hash(user.password, 10);
    user.password = hashedPwd;
  
    await user.save();
    return res.status(200).render('index', {data:'User registered successfully'});
  } catch(err) {
    console.log(err);
    res.status(500).send('Unable to process request');
  }
})

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
//     const user = await User.findOne({email: 'test6@gmail.com'});

//     const file = new File({
//       email: user.email,
//       userId: user._id,
//       file: 'file6.xlsx'
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
    if(!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }
    res.status(200).send('User logged in');
  } catch(err) {
    res.status(500).send('Unable to Login');
  }
})

app.get('/files', async (req, res) => {
  try {
    const email = req.query.email;
    const userFiles = await File.findOne({email});
    if (userFiles) {
      return res.status(200).send(userFiles.files)
    }
    return res.status(400).send('File not found');
  } catch(err) {
    res.status(500).json({err: err.message});
  }
})

app.get('/file', (req, res) => {
  try {
    const fileName = req.query.name;
    const filePath = `${__dirname}/files/${fileName}`;
    const workbook = XLSX.readFile(filePath, {cellDates:true});
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
    res.status(200).send(JSON.stringify(data));
  } catch(err) {
    res.status(500).json({err: err.message});
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));