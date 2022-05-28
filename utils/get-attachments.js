const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');
const { writeFile } = require('node:fs/promises');
const { Base64 } = require('js-base64');

const User = require('../models/User.model');
const File = require('../models/File.model');
const { getOAuth2Client } = require('../config/google-auth.js');

const gmail = google.gmail('v1');

async function getAttachments(userId, searchQuery) {
  try {
    const FILE_FORMAT = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const user = await User.findById(userId);
    const userFiles = await File.findOne({userId});
    google.options({auth: getOAuth2Client(user.refresh_token)});

    const messagesList = await gmail.users.messages.list({
      userId: user.email,
      q: `in:inbox has:attachment xlsx ${searchQuery}`
    });
  
    if(!messagesList?.data?.messages?.length) {
      return null;
    }
  
    const messagesData = await Promise.all(messagesList.data.messages.map(async (message) => {
      const messageBody = await gmail.users.messages.get({
        id: message.id,
        userId: user.email
      });
  
      const attachmentDetails = messageBody.data.payload.parts
        .filter((msgPart) => msgPart.mimeType === FILE_FORMAT && msgPart.body.attachmentId)
        .map((msgPart) => ({
          fileName: msgPart.filename,
          attachmentId: msgPart.body.attachmentId
        }))[0];
  
      //This will be undefined when mail has attachment but of different type than xlsx
      if(!attachmentDetails) return;
  
      const attachment = await gmail.users.messages.attachments.get({
        id: attachmentDetails.attachmentId,
        messageId: message.id,
        userId: user.email
      });

      //Check if file is present in userFiles
      const savedFile = userFiles.files.find(file => file.messageId === message.id);

      //If an attachment is already saved in nodejs, dont save it again
      if(!savedFile) {
        const decodedData = Base64.toUint8Array(attachment.data.data);
        const storedFileName = uuidv4();
        await writeFile(`files/${storedFileName}`, decodedData);

        await File.findOneAndUpdate({ userId }, {
          $push: {
            'files': {
              displayName: attachmentDetails.fileName,
              fileName: storedFileName,
              messageId: message.id,
              source: 'Gmail'
            }
          }
        });
      }
  
      return {
        originalFileName: attachmentDetails.fileName
      };
    }));
    
    return messagesData.filter((messageData) => !!messageData);
  } catch(err) {
    throw Error(err);
  }
}

module.exports = { getAttachments };