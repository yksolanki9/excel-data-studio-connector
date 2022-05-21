const express = require('express');
const XLSX = require('xlsx');
const bcrypt = require('bcrypt');
const multer = require('multer');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
let LocalStrategy = require('passport-local').Strategy;
require('./config/mongoose');

const User = require('./models/User.model');
const File = require('./models/File.model');
const { default: mongoose } = require('mongoose');

const app = express();
const upload = multer({ dest: './files' });

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function(req, res, next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
  next();
});

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},async (req, email, password, done) => {
  try {
    const user = await User.findOne({email});
    if (!user) {
      return done(null, false, req.flash('error_msg', 'Email is not registered.'));
    }
    const isValidPwd  = await bcrypt.compare(password, user.password);
    if(!isValidPwd) {
      return done(null, false, req.flash('error_msg', 'Incorrect Password. Please try again.'));
    }
    return done(null, user);
  } catch(err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch(err) {
    done(err);
  }
});

function isLoggedIn(req, res, next){
  if (!req.isAuthenticated()) {
    req.flash('error_msg', 'You are not logged in. Please log in to continue');
    return res.redirect('/login');
  }
  return next();
}

app.get('/', (req, res) => {
  res.redirect('/upload');
});

app.get('/register', (req, res) => {
  res.render('pages/register');
});

app.post('/register', async (req, res) => {
  try {
    const {name, email, password} = req.body;
    let user = await User.findOne({email});
    if (user) {
      req.flash('error_msg', 'User with email already exists. Please log in or try with different email');
      return res.redirect('/register');
      // return res.status(401).render('pages/index', {data:'User with email already exists'});
    }
    user = new User({
      _id: mongoose.Types.ObjectId(),
      name,
      email,
      password
    });

    const hashedPwd = await bcrypt.hash(user.password, 10);
    user.password = hashedPwd;
  
    await user.save();

    const userFiles = new File({
      email: user.email,
      userId: user._id,
      file: []
    });
    await userFiles.save();
    req.flash('success_msg', 'You have registered successfully. Please log in');
    res.redirect('/login');
  } catch(err) {
    req.flash('error_msg', 'Unable to register. Please try again');
    res.redirect('/register');
  }
})

app.get('/login', (req, res) => {
  res.render('pages/login');
});

app.post('/login', passport.authenticate('local', {
	failureRedirect: '/login',
  failureFlash: true 
	}), (req, res) => {
    res.redirect('/upload');
})

app.get('/upload', isLoggedIn, (req, res) => {
  res.render('pages/upload');
})

app.post('/upload', isLoggedIn, upload.single('file'), async (req, res) => {
  try {
    const fileData = req.file;
    await File.findOneAndUpdate({ userId: req.user._id }, {
      $push: {
        'files': {
          displayName: fileData.originalname,
          fileName: fileData.filename
        }
      }
    });
    req.flash('success_msg', 'File uploaded successfully!');
  } catch(err) {
    req.flash('error_msg', 'Unable to upload file. Please try again');
  } finally {
    res.redirect('/upload');
  }
})

app.get('/all-files', isLoggedIn, async (req, res) => {
  try {
    const userFiles = await File.findOne({email: req.user.email});
    const files = userFiles.files.map(file => file.displayName);
    res.render('pages/all-files', {files});
  } catch(err) {
    res.status(500).json({err: err.message});
  }
})

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