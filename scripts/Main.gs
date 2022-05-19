var cc = DataStudioApp.createCommunityConnector();

function getConfig() {
  try {
  const userFiles = JSON.parse(getFiles()); 

  const configOptions = userFiles.map((file) => ({
    label: file.displayName,
    value: file.fileName
  }));

  const config = {
    configParams: [{
      type: 'SELECT_SINGLE',
      name: 'fileName',
      displayName: 'Select a file name',
      helpText: 'Select a file name',
      parameterControl: {
        allowOverride: true
      },
      options: configOptions
    }]
  }

  return config;
  } catch(err) {
    console.log('ERROR', err);
    resetAuth();
  }
}

function getUserEmail() {
  const properties = PropertiesService.getUserProperties();
  return properties.getProperty('username');
}

function getFiles() {
  try {
  var url = [
    'https://7181-175-100-180-155.in.ngrok.io/',
    'files?email=',
    getUserEmail()
  ].join('');
  var response = UrlFetchApp.fetch(url);
  return response;
  } catch(err) {
    console.log('ERROR', err);
    resetAuth();
  }
}

function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;

  fields
    .newDimension()
    .setId('group')
    .setName('Group')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('category')
    .setName('Category')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('room')
    .setName('Room')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('jan-2020')
    .setName('January 2020')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('feb-2020')
    .setName('February 2020')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('mar-2020')
    .setName('March 2020')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('apr-2020')
    .setName('April 2020')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('jun-2020')
    .setName('June 2020')
    .setType(types.TEXT)
    
    fields
    .newDimension()
    .setId('jul-2020')
    .setName('July 2020')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('aug-2020')
    .setName('August 2020')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('sep-2020')
    .setName('September 2020')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('oct-2020')
    .setName('October 2020')
    .setType(types.TEXT)
    
    fields
    .newDimension()
    .setId('nov-2020')
    .setName('November 2020')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('dec-2020')
    .setName('December 2020')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('total')
    .setName('Total')
    .setType(types.NUMBER)

  return fields;
}

function getSchema(request) {
  return {schema: getFields().build()};
}

function getData(request) {
  request.configParams = validateConfig(request.configParams);

  var requestedFields = getFields().forIds(
    request.fields.map(function(field) {
      return field.name;
    })
  );

  try {
    var apiResponse = fetchDataFromApi(request);
    var data = getFormattedData(JSON.parse(apiResponse), requestedFields);
  } catch (e) {
    cc.newUserError()
      .setDebugText('Error fetching data from API. Exception details: ' + e)
      .setText(
        'The connector has encountered an unrecoverable error. Please try again later, or file an issue if this error persists.'
      )
      .throwException();
  }

  return {
    schema: requestedFields.build(),
    rows: data
  };
}

function validateConfig(configParams) {
  // configParams = configParams || {};
  // configParams.client_id = configParams.client_id || '12345';
  // configParams.access_token = configParams.access_token || '12345';
  return configParams;
}

function fetchDataFromApi(request) {
  try {
    var url = [
      'https://7181-175-100-180-155.in.ngrok.io',
      '/file?name=',
      request.configParams.fileName
    ].join('');
    var response = UrlFetchApp.fetch(url);
    return response;
  } catch(err) {
    console.log('ERROR', err);
  }
}

function getFormattedData(response, requestedFields) {
  const reqFieldArray = requestedFields.asArray().map(reqField => reqField.getName());
  
  const data = response.map(entry => {
    const val = reqFieldArray.map(req => entry[req]);
    return {
      values: val
    }
  });
 
  return data;
}