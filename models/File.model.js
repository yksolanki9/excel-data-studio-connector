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
    fileSource: {
      // fileSource will be either 'Gmail' or 'User Upload'
      type: String,
      required: true
    },
    messageId: {
      type: String
    }
  }]
});

const File = mongoose.model('File', fileSchema);

module.exports = File;