### About Google Data Studio
Google Data Studio is an online tool for converting raw data into customizable informative reports and dashboards

### Setting up the app
- Git clone repo
- Run `npm i` to install all the dependencies
- Since our connector code is running in [Google App Scrips](https://developers.google.com/apps-script), we need to make our excel files available on the internet, so we're using ngrok. It basically hosts our localhost on a url which can be accessed from anywhere.
- Install [ngrok](https://ngrok.com/) in your system and run it using `ngrok http <port>`.
- You need to add the ngrok custom url in your app scripts project while making api call
- Also, add your excel sheets inside `data` directory and following the naming convention `<CLIENT_ID>-<ACCESS_TOKEN>.xlsx`
- Go to [Google Data Studio](https://datastudio.google.com/overview) and log in with your google account
- Now open [Excel - Data Studiok Connector ](https://datastudio.google.com/datasources/7588d645-ac55-48b1-badc-104f1de40da1)
-  Enter the `ACCESS_TOKEN` and `CLIENT_ID` -> `Create a Report`. You'll see a report populated with data from your excel sheet


### Contact information
Please feel free to reach out to me at `yashsolanki1709@gmail.com` in case you have any queries.