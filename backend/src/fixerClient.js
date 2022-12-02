// https://apilayer.com/marketplace/fixer-api
// Available Endpoints
// /symbols         Returns all available currencies.
// /latest          Returns real-time exchange rate data for all available or a specific set of currencies.
// /convert         Allows for conversion of any amount from one currency to another.
// /{date}          Returns historical exchange rate data for all available or a specific set of currencies.
// /timeseries      Returns daily historical exchange rate data between two specified dates for all available or a specific set of currencies.
// /fluctuation     Returns fluctuation data between two specified dates for all available or a specific set of currencies.

const URL_CURRENCY_CODE_LIST = "https://api.apilayer.com/fixer/symbols";
const URL_LATEST_EXCHANGE_RATES = "https://api.apilayer.com/fixer/latest";
// /convert is available but returns just a single destination amount but we need two (also USD) so we would need to do 2 calls

module.exports = class {
    constructor(appId) {
        console.log("Fixer constructor");
        this.APP_ID = appId;
        this.currencyCodes = [];
    }

    async getCurrencyCodeList() {
        if (this.currencyCodes.length > 0) {
            console.log("Using code list cached from fixer.io");
            return { currencyCodes: this.currencyCodes };
        }
        console.log("Getting currency code list from fixer.io");
        let currenciesReponse = await fetch(URL_CURRENCY_CODE_LIST, { headers: { apikey: this.APP_ID } });
        try {
            let parsedCurrencies = await currenciesReponse.json();
            this.currencyCodes = Object.keys(parsedCurrencies.symbols);
            console.log("Received list of currencies", this.currencyCodes.length);
            return { currencyCodes: this.currencyCodes };
        } catch (e) {
            console.error("Can't parse list of currencies", e);
            return { error: 3456, errorMessage: "Can't get currency code list" };
        }
    }

    async convert(parameters) {
        // let url = `${URL_LATEST_EXCHANGE_RATES}&amount=${parameters.amount}&from=${parameters.sourceCurrency}&to=${parameters.destinationCurrency}`
        let url = `${URL_LATEST_EXCHANGE_RATES}&base=${parameters.sourceCurrency}&symbols=USD,${parameters.destinationCurrency}`
        console.log("Getting current exchange rates from fixer.org");
        let response = await fetch(url, { headers: { apikey: this.APP_ID } });
        console.log("got response");
        try {
            let responseDecoded = await response.json();
            console.log("decoded response");
            return {
                destinationAmount: parameters.amount * responseDecoded.rates[parameters.destinationCurrency],
                remainingQuota: {
                    requestsRemaining: response.headers.get("x-ratelimit-remaining-month"),
                    requestsQuota: response.headers.get("x-ratelimit-limit-month"),
                    daysRemaining: response.headers.get("ratelimit-reset") / 60 / 60 / 24,
                },
                usdEquivalent: parameters.amount * responseDecoded.rates.USD,
            };
        } catch (e) {
            console.log("Exception caught", e);

            return { error: 1234 };
        }

    }
}
