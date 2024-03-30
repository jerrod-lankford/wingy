# wingy
Wing ordering robot

Wingy will post an order form to slack. Once all the orders are gathered it will then open a chrome instance via puppeteer and place all of the others. Once i have manually verified the orders
and placed the order it will calculate the payments and message all participants. It then provides status updates in the slack thread.

# Installation

1. Go to https://api.slack.com/apps
2. Create New App > Select name and workspace
3. Click bots and add the following oauth scopes: `channels:join, chat:write, chat:write.customize, files:write, im:read, im:write`
4. Go to Interactivity & Shortcuts, Enable and add the following url `https://wingy.herokuapp.com/slack`

## Configuration
1. From the above website go to Oauth settings and copy the Bot User Oauth Token
2. Set the following values in bot/secrets.json (you will have to create)
```
{ "slack_token": <bot oauth token>, "password": <wings over password> }
```
3. Open configuration.json and set all of the appropriate properties