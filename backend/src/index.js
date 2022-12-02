const express = require("express");
const statistics = require("./statistics.js");
OpenexchangeratesClient = require("./openexchangeratesClient.js");
FixerClient = require("./fixerClient.js");
CurrencylayerClient = require("./currencylayerClient.js");
const CONFIG = require("../config.json");
var providers = [
    { priority: 1, api: new OpenexchangeratesClient(CONFIG.backend.openexchangeratesAppId) },
    { priority: 1, api: new FixerClient(CONFIG.backend.fixerApiKey) }
];

const app = express();
statistics.initialise();

var currencies = [];
app.post("/api/convert", async (req, res) => {
    console.log("serving", req.route.path, req.query);
    if (currencies.length === 0) {
        console.log("We need currency code list to validate the request but /api/currencyCodes was not called yet, getting now")
        let currenciesCodeList = await providers[0].api.getCurrencyCodeList(); // TODO: same comment as at /api/currencyCodes
        if (currenciesCodeList.error !== undefined) {
            res.json({
                error: 7654,
                errorMessage: "Can't get list of currencies for request validation"
            });
            return;
        }
        currencies = currenciesCodeList.currencyCodes;
    }
    if (req.query.amount === undefined || req.query.src === undefined || req.query.dst === undefined
        || !currencies.includes(req.query.src) || !currencies.includes(req.query.dst)) {
        res.json({
            error: 9876,
            errorMessage: "Invalid request structure. Required fields: amount, src and dst. "
                + "Values of 'src' and 'dst' must be from the list received from /api/statistics",
            exampleRequest: `${req.route.path}?amount=123&src=EUR&dst=USD`
        });
        return;
    }
    let theHighestProviderPriorityIndex = 0;
    providers.forEach((provider, index) => {
        console.log("provider #", index, "has priority", provider.priority);
        if (provider.priority > providers[theHighestProviderPriorityIndex].priority) {
            theHighestProviderPriorityIndex = index;
        }
    });
    const result = await providers[theHighestProviderPriorityIndex].api.convert({ amount: req.query.amount, sourceCurrency: req.query.src, destinationCurrency: req.query.dst });
    if (result.error !== undefined) {
        res.json(result);
        return;
    }
    if (result.destinationAmount === undefined) {
        return { error: 6543 };
    }
    let quotaPercentRemaining = result.remainingQuota.requestsRemaining / result.remainingQuota.requestsQuota;
    let quotaPercentRemainingPerDay = quotaPercentRemaining / result.remainingQuota.daysRemaining;
    console.log("remains", quotaPercentRemaining, " for ", result.remainingQuota.daysRemaining, "days which is ", quotaPercentRemainingPerDay, " per day");
    providers[theHighestProviderPriorityIndex].priority = quotaPercentRemainingPerDay;
    statistics.updateStatistics({ amount: result.usdEquivalent, destinationCurrency: req.query.dst })
    let statData = statistics.getStatistics();
    if (statData.error !== undefined) statData = {};
    res.json({ destinationAmount: result.destinationAmount, statistics: statData });
});

app.get("/api/statistics", (req, res) => {
    console.log("serving", req.route.path);
    res.json(statistics.getStatistics());
});

app.get("/api/currencyCodes", async (req, res) => {
    console.log("serving", req.route.path);
    let currencyCodeList = await providers[0].api.getCurrencyCodeList();
    // TODO: we should call all provides, probably, compare the results and use intersection(?)
    if (currencyCodeList.error !== undefined) {
        console.error("Can't get currency code list.");
        res.json({ error: 8765 });
        return;
    }
    currencies = currencyCodeList.currencyCodes;
    res.json(currencyCodeList);
});

app.listen(CONFIG.backend.serverPort, () => {
    console.log("Server listening on", CONFIG.backend.serverPort);
});
