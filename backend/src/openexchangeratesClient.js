// https://openexchangerates.org/account/app-ids
const URL_CURRENCY_CODE_LIST = "https://openexchangerates.org/api/currencies.json";
const URL_LATEST_EXCHANGE_RATES = "https://openexchangerates.org/api/latest.json";
const URL_USAGE = "https://openexchangerates.org/api/usage.json";

module.exports = class {
    constructor(appId) {
        console.log("Openexchangerates constructor");
        this.APP_ID = appId;
        this.remainingQuota = {
            requestsRemaining: 0,
            requestsQuota: 0,
            daysRemaining: 0 // TODO: limitRefreshesInDays reload periodically
        }
        this.initialise();
    }

    async initialise() {
        let usageReponse = await fetch(`${URL_USAGE}?app_id=${this.APP_ID}`);
        try {
            let usageReponseDecoded = await usageReponse.json();
            if (usageReponseDecoded.status == 200) {
                console.log("Usage info for provided API key", usageReponseDecoded.data.usage);
                this.remainingQuota.requestsRemaining += usageReponseDecoded.data.usage.requests_remaining;
                this.remainingQuota.requestsQuota = usageReponseDecoded.data.usage.requests_quota;
                this.remainingQuota.daysRemaining = usageReponseDecoded.data.usage.days_remaining;
            } else {
                console.error("API key refused", usageReponseDecoded);
            }
        } catch (e) {
            console.error("Can't get usage info for this API key, the app will most likely not work.", e);
        }
    }

    async getCurrencyCodeList() {
        console.log("Getting currency code list from openexchangerates.org");
        let currenciesReponse = await fetch(URL_CURRENCY_CODE_LIST);
        try {
            let parsedCurrencies = await currenciesReponse.json();
            let currencyCodes = Object.keys(parsedCurrencies);
            console.log("Received list of currencies", currencyCodes.length);
            return { currencyCodes: currencyCodes };
        } catch (e) {
            console.error("Can't parse list of currencies", e);
            return { error: 3456, errorMessage: "Can't get currency code list" };
        }
    }

    async convert(parameters) {
        /*
        TODO: A more convenient API endpoint exists but it's not available for free plan:
        https://openexchangerates.org/api/convert/{value}/{from}/{to}
        Currency conversion requests are currently available for clients on the Unlimited plan.
        
        TODO: This API supports handy parameters but they are not available free plan:
        https://openexchangerates.org/api/latest.json&base=...&symbols=...,...
        Changing the API `base` currency is available for Developer, Enterprise and Unlimited plan clients.
        Please upgrade, or contact support@openexchangerates.org with any questions.
        */

        console.log("Getting current exchange rates from openexchangerates.org");
        let response = await fetch(`${URL_LATEST_EXCHANGE_RATES}?app_id=${this.APP_ID}&symbols=${parameters.sourceCurrency},${parameters.destinationCurrency}`);
        --this.remainingQuota.requestsRemaining;
        try {
            let responseDecoded = await response.json();
            if (responseDecoded.error !== undefined) {
                console.error("Exchange rates provider returner error", responseDecoded);
                return { error: 1234, errorMessage: "Exchange rates provider returner error" };
            }

            let usdEquvalent = parameters.amount / responseDecoded.rates[parameters.sourceCurrency];
            return {
                destinationAmount: usdEquvalent * responseDecoded.rates[parameters.destinationCurrency],
                remainingQuota: this.remainingQuota,
                usdEquivalent: usdEquvalent
            };
        } catch (e) {
            console.info("can't parse list of the latest exchange rates", e);
            return { error: 2345, errorMessage: "Statistics not ready yet" };
        }
    }

}
