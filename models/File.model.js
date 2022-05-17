const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
  email: String,
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User'
  },
  files: [String]
});

const File = mongoose.model('File', fileSchema);

module.exports = File;