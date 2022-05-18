function getAuthType() {
  var cc = DataStudioApp.createCommunityConnector();
  return cc
    .newAuthTypeResponse()
    .setAuthType(cc.AuthType.USER_PASS)
    .build();
}

function setCredentials(request) {
  var isCredentialsValid = validateCredentials(request.userPass.username, request.userPass.password);
  if (!isCredentialsValid) {
    return {
      errorCode: "INVALID_CREDENTIALS"
    };
  } else {
    storeUserData(request.userPass.username, request.userPass.password);
    return {
      errorCode: "NONE"
    };
  }
};

function resetAuth() {
  var userProperties = PropertiesService.getUserProperties();
  userProperties.deleteProperty('username');
  userProperties.deleteProperty('password');
}

function isAuthValid() {
  const userProperties = loadUserData();
  return userProperties.username && userProperties.password && validateCredentials(userProperties.username, userProperties.password)
};

function loadUserData() {
  const properties = PropertiesService.getUserProperties();
  return {
    username: properties.getProperty('username'),
    password: properties.getProperty('password')
  }
};

function validateCredentials(username, password) {
  var rawResponse = UrlFetchApp.fetch('https://19fc-175-100-180-155.in.ngrok.io/auth', {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Utilities.base64Encode(username + ':' + password)
      },
      muteHttpExceptions: true
    });

    return rawResponse.getResponseCode() === 200;
  }

  function storeUserData(username, password) {
    PropertiesService
      .getUserProperties()
      .setProperty('username', username)
      .setProperty('password', password);
  };
