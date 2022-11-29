const express = require("express");
const path = require("path");
const statistics = require("./statistics");
const calculator = require("./openexchangeratesClient.js");
const CONFIG = require("./config.json");

const app = express();
calculator.initialise(CONFIG.backend.openexchangeratesAppId);

app.get("/", (req, res) => {
    console.log("serving", req.route.path);
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

var currencies = [];
app.post("/api/convert", async (req, res) => {
    console.log("serving", req.route.path, req.query);
    if (currencies.length === 0) {
        console.log("We need currency code list to validate the request but /api/currencyCodes was not called yet, getting now")
        let currenciesCodeList = await calculator.getCurrencyCodeList();
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
    const result = await calculator.convert({ amount: req.query.amount, sourceCurrency: req.query.src, destinationCurrency: req.query.dst });
    if (result.error !== undefined) {
        res.json(result);
        return;
    }
    statistics.updateStatistics({ amount: result.usdEquivalent, destinationCurrency: req.query.dst })
    res.json({ destinationAmount: result.destinationAmount, statistics: statistics.getStatistics() });
});

app.get("/api/statistics", (req, res) => {
    console.log("serving", req.route.path);
    res.json(statistics.getStatistics());
});

app.get("/api/currencyCodes", async (req, res) => {
    console.log("serving", req.route.path);
    let currencyCodeList = await calculator.getCurrencyCodeList();
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
