const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
  email: String,
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  files: [{
    fileName: String,
    displayName: String
  }]
});

const File = mongoose.model('File', fileSchema);

module.exports = File;