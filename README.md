# Getting Started with Purple Currency Convertor

Project consists from three components: backend and two alternatives of frontends.

## First steps after gitcloning

After you clone this repository, first step that you will have to do is installing node modules.

### `npm install`

This will download and install Node modules for the backend component (about 3 MB).

### `cd client-React; npm install`

This command will download and install Node modules for the React-based frontend component (about 400 MB).

## Starting the project

All components can be started with a single command 

### `npm start`

This will start Node.JS with the backend component (listening on localhost port 3001) and also another Node.JS for the React-based frontend (listening on localhost port 3000), configured to proxy API requests to backend port 3001.

Backend port can be configred in `backend/config.json` if needed.

You will also need to register at https://openexchangerates.org and get your own API key. Once you have it, please put it to `backend/config.json`.

## Backend API for creating your own frontend

Backend component provides public API for creating your own frontend.

### `/api/convert`

This endpoint expect three input parameter passed in URL:
* amount - a float value representing the sum in the source currency to be converted
* src - code of the source currency; list of accepted codes can be obtained from API endpoint `/api/currencyCodes` (see below)
* dst - code of the destination currency

Example request:

`curl -X POST "http://localhost:3001/api/convert?amount=1234&src=EUR&dst=CZK"`

Beside the amount in converted in the desired destination currency (`destinationAmount`) the response also contains `statistics` part containing values updated after the request. Example response:

>{
>    "destinationAmount": 30043.200960597893,
>    "statistics": {
>        "mostPopularCurrencies": "CZK",
>        "totalAmountConverted": 1277.3467623814133,
>        "numberOfRequestsMade": 1
>    }
>}

Method: **POST**

### `/api/currencyCodes`

This endpoint doesn't expect any input parameter. Example request:

`curl http://localhost:3001/api/currencyCodes`

Example response:

>{
>    "currencyCodes": ["AED","AFN","ALL","AMD","ANG","AOA"]
>}

Method: **GET**

### `/api/statistics`

This endpoint doesn't expect any input parameter. Example request:

`curl localhost:3001/api/statistics`

Example response:

>{
>    "mostPopularCurrencies": "CZK",
>    "totalAmountConverted": 123456,
>    "numberOfRequestsMade": 1234
>}

Method: **GET**