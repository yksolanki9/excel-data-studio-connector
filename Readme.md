### About Google Data Studio
Google Data Studio is an online tool for converting raw data into customizable informative reports and dashboards

### Setting up the app
- Git clone repo
- Run `npm i` to install all the dependencies
- Go to `http://localhost:3000/register` and create an account
- Since our connector code is running in [Google App Scrips](https://developers.google.com/apps-script), we need to make our excel files available on the internet, so we're using ngrok. It basically hosts our localhost on a url which can be accessed from anywhere.
- Install [ngrok](https://ngrok.com/) in your system and run it using `ngrok http <port>`.
- You need to add the ngrok custom url in your app scripts project while making api call
- Also, add your excel sheets inside `files` directory and each of the scripts is mapped to a user who saved it, you can check the `File` model for more info.
- Go to [Google Data Studio](https://datastudio.google.com/overview) and log in with your google account
- Now open [Excel - Data Studiok Connector ](https://datastudio.google.com/u/0/datasources/create?connectorId=AKfycbwRZOVwzL4QpOiX4sCXhrr_q9k6_itMNAuxTtJfOYHR)
-  Select the excel sheet name you wish to use as data source. You'll see a report populated with data from your excel sheet

### Contact information
Please feel free to reach out to me at `yashsolanki1709@gmail.com` in case you have any queries.