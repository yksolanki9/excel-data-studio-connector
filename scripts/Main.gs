var cc = DataStudioApp.createCommunityConnector();

// function getConfig() {
//   var config = cc.getConfig();

//   const userFiles = JSON.parse(getFiles());

//   config
//     .newInfo()
//     .setId('instructions')
//     .setText(
//       'Enter npm package names to fetch their download count. An invalid or blank entry will revert to the default value.'
//     );

//   config
//     .newTextInput()
//     .setId('client_id')
//     .setName(
//       'Enter CLIENT_ID'
//     )
//     .setPlaceholder('12345')
//     .setAllowOverride(true);

//   config
//     .newTextInput()
//     .setId('access_token')
//     .setName(
//       'Enter ACCESS_TOKEN'
//     )
//     .setPlaceholder('12345')
//     .setAllowOverride(true);

//   const data = config
//     .newSelectSingle()
//     .setId('fileName')
//     .setName(
//       'Select a File to view'
//     )
//     .setHelpText('Select a file name')
//     .setAllowOverride(true);

//   userFiles.reduce((data, file) => data.addOption(config.newOptionBuilder().setLabel(file).setValue(file)), data);

//   return config.build();
// }

function getConfig() {
  const userFiles = JSON.parse(getFiles()); 

  const configOptions = userFiles.map((file) => ({
    label: file,
    value: file
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
      // options: [{
      //   label: 'Test Label',
      //   value: 'testValue'
      // }]
    }]
  }

  return config;
}

function getUserEmail() {
  const properties = PropertiesService.getUserProperties();
  return properties.getProperty('username');
}

function getFiles() {
  var url = [
    'https://868f-175-100-180-155.in.ngrok.io/',
    'files?email=',
    getUserEmail()
  ].join('');
  console.log('URL IS', url);
  var response = UrlFetchApp.fetch(url);
  return response;
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
    .setType(types.TEXT)

  return fields;
}

function getSchema(request) {
  return {schema: getFields().build()};
}

function getData(request) {
  request.configParams = validateConfig(request.configParams);
  console.log('CONFIG PARAMS', request.configParams);

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
  var url = [
    'https://868f-175-100-180-155.in.ngrok.io',
    '/file?name=',
    request.configParams.fileName
  ].join('');
  console.log('URL INSIDE GOOGLE SCRIPT', url);
  var response = UrlFetchApp.fetch(url);
  return response;
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