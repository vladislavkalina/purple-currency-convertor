// https://apilayer.com/marketplace/currency_data-api
// Available Endpoints
// / list           Returns all available currencies.
// / live           Get the most recent exchange rate data.
// / convert        Convert one currency to another.
// / historical     Get historical rates for a specific day.
// / timeframe      Request exchange rates for a specific period of time.
// / change         Request any currency's change parameters (margin, percentage).

const URL_CURRENCY_CODE_LIST = "https://api.apilayer.com/currency_data/list";
const URL_LATEST_EXCHANGE_RATES = "https://api.apilayer.com/currency_data/live";
// /convert is available but returns just a single destination amount but we need two (also USD) so we would need to do 2 calls

module.exports = class {
    constructor(accessKey) {
        console.log("Currencylayer constructor");
        this.APP_ID = accessKey;
        this.currencyCodes = [];
    }

    async getCurrencyCodeList() {
        if (this.currencyCodes.length > 0) {
            console.log("Using code list cached from currencylayer.com");
            return { currencyCodes: this.currencyCodes };
        }
        console.log("Getting currency code list from currenclylayer.com");
        try {
            let currenciesReponse = await fetch(URL_CURRENCY_CODE_LIST, { headers: { apikey: this.APP_ID } });
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
        let url = `${URL_LATEST_EXCHANGE_RATES}&source=${parameters.sourceCurrency}&currencies=USD,${parameters.destinationCurrency}`
        console.log("Getting current exchange rates from currencylayer.com");
        try {
            let response = await fetch(url, { headers: { apikey: this.APP_ID } });
            let responseDecoded = await response.json();
            console.log("decoded response", responseDecoded);
            return {
                destinationAmount: parameters.amount * responseDecoded.quotes[parameters.sourceCurrency + parameters.destinationCurrency],
                remainingQuota: {
                    requestsRemaining: response.headers.get("x-ratelimit-remaining-month"),
                    requestsQuota: response.headers.get("x-ratelimit-limit-month"),
                    daysRemaining: response.headers.get("ratelimit-reset") / 60 / 60 / 24,
                },
                usdEquivalent: parameters.amount * responseDecoded.quotes[parameters.sourceCurrency + "USD"],
            };
        } catch (e) {
            console.log("Exception caught", e);

            return { error: 1234 };
        }
    }
}