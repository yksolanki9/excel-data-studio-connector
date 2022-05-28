const mongoose = require('mongoose');

const fileSchema = mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    fileName: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    source: {
      type: String,
      enum: ['UPLOAD', 'GMAIL'],
      default: 'UPLOAD'
    },
    messageId: {
      type: String
    }
  }]
});

const File = mongoose.model('File', fileSchema);

module.exports = File;