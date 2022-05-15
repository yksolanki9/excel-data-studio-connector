var cc = DataStudioApp.createCommunityConnector();

function getConfig() {
  var config = cc.getConfig();

  config
    .newInfo()
    .setId('instructions')
    .setText(
      'Enter npm package names to fetch their download count. An invalid or blank entry will revert to the default value.'
    );

  config
    .newTextInput()
    .setId('client_id')
    .setName(
      'Enter CLIENT_ID'
    )
    .setPlaceholder('12345')
    .setAllowOverride(true);

  config
    .newTextInput()
    .setId('access_token')
    .setName(
      'Enter ACCESS_TOKEN'
    )
    .setPlaceholder('12345')
    .setAllowOverride(true);

  return config.build();
}

function getFields() {
  var fields = cc.getFields();
  var types = cc.FieldType;

  fields
    .newDimension()
    .setId('created')
    .setName('Created')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('Enterprise')
    .setName('Enterprise')
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId('mode')
    .setName('Mode')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('start')
    .setName('Start')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('end')
    .setName('End')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('group-by')
    .setName('Group By')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('status')
    .setName('Status')
    .setType(types.TEXT)

  fields
    .newDimension()
    .setId('values')
    .setName('Values')
    .setType(types.TEXT)

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
  configParams = configParams || {};
  configParams.client_id = configParams.client_id || '12345';
  configParams.access_token = configParams.access_token || '12345';
  return configParams;
}

function fetchDataFromApi(request) {
  var url = [
    'https://7e47-2405-204-285-8dbf-8813-45f6-abb6-a17b.in.ngrok.io/',
    request.configParams.client_id,
    '?access_token=',
    request.configParams.access_token
  ].join('');
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