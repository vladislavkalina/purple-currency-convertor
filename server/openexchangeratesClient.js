// https://openexchangerates.org/account/app-ids
const APP_ID = "0bdb980717af47498ce42dabbef3b4c7";
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
        console.info("Can't parse list of currencies", e);
    }
    return currencyCodes;
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
    let response = await fetch(`${URL_LATEST_EXCHANGE_RATES}?app_id=${APP_ID}&symbols=${parameters.sourceCurrency},${parameters.destinationCurrency}`);
    try {
        responseDecoded = await response.json();
        // console.log(responseDecoded)

        let usdEquv = parameters.amount / responseDecoded.rates[parameters.sourceCurrency];
        return {
            destinationAmount: usdEquv * responseDecoded.rates[parameters.destinationCurrency],
            usdEquivalent: usdEquv
        };
    } catch (e) {
        console.info("can't parse list of the latest exchange rates");
        return { "errorMessage": "Statistics not ready yet" };
    }
}

exports.logUsageInfo = async () => {
    let usageReponse = await fetch(`${URL_USAGE}?app_id=${APP_ID}`);
    try {
        usageReponseDecoded = await usageReponse.json();
        console.log(usageReponseDecoded.data.usage);
    } catch (e) {
        console.info("Can't parse usage info", e);
    }
}
