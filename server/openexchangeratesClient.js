// https://openexchangerates.org/account/app-ids
var APP_ID = "";
const URL_CURRENCY_CODE_LIST = "https://openexchangerates.org/api/currencies.json";
const URL_LATEST_EXCHANGE_RATES = "https://openexchangerates.org/api/latest.json";
const URL_USAGE = "https://openexchangerates.org/api/usage.json";

exports.getCurrencyCodeList = async () => {
    console.log("getting currencies from openexchangerates.org");
    let currenciesReponse = await fetch(URL_CURRENCY_CODE_LIST);
    let currencyCodes = [];
    try {
        parsedCurrencies = await currenciesReponse.json();
        currencyCodes = Object.keys(parsedCurrencies);
        console.log("Received list of currencies", currencyCodes.length);
    } catch (e) {
        console.error("Can't parse list of currencies", e);
        return { error: 3456, errorMessage: "Can't get currency code list" };
    }
    return { currencyCodes: currencyCodes };
}

exports.convert = async (parameters) => {
    /*
    TODO: A more convenient API endpoint exists but it's not available for free plan:
    https://openexchangerates.org/api/convert/{value}/{from}/{to}
    Currency conversion requests are currently available for clients on the Unlimited plan.
    
    TODO: This API supports handy parameters but they are not available free plan:
    https://openexchangerates.org/api/latest.json&base=...&symbols=...,...
    Changing the API `base` currency is available for Developer, Enterprise and Unlimited plan clients.
    Please upgrade, or contact support@openexchangerates.org with any questions.
    */

    console.log("getting currencies from openexchangerates.org");
    let response = await fetch(`${URL_LATEST_EXCHANGE_RATES}?app_id=${APP_ID}0&symbols=${parameters.sourceCurrency},${parameters.destinationCurrency}`);
    try {
        responseDecoded = await response.json();
        if (responseDecoded.error !== undefined) {
            console.error("Exchange rates provider returner error", responseDecoded);
            return { error: 1234, errorMessage: "Exchange rates provider returner error" };
        }

        let usdEquvalent = parameters.amount / responseDecoded.rates[parameters.sourceCurrency];
        return {
            destinationAmount: usdEquvalent * responseDecoded.rates[parameters.destinationCurrency],
            usdEquivalent: usdEquvalent
        };
    } catch (e) {
        console.info("can't parse list of the latest exchange rates");
        return { error: 2345, errorMessage: "Statistics not ready yet" };
    }
}

exports.initialise = async (appId) => {
    APP_ID = appId;
    let usageReponse = await fetch(`${URL_USAGE}?app_id=${APP_ID}`);
    try {
        usageReponseDecoded = await usageReponse.json();
        if (usageReponseDecoded.status == 200) {
            console.log("Usage info for provided API key", usageReponseDecoded.data.usage);
        } else {
            console.error("API key refused", usageReponseDecoded);
        }
    } catch (e) {
        console.error("Can't get usage info for this API key, the app will most likely not work.", e);
    }
}
