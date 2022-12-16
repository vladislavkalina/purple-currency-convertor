const express = require("express");
const statistics = require("./statistics.js");
const CONFIG = require("../config.json");
const providerManager = require("./providerManager.js");
providerManager.initialize(CONFIG.backend.apiKeys);

const app = express();
statistics.initialise();

app.post("/api/convert", async (req, res) => {
    console.log("serving", req.route.path, req.query);
    if (req.query.amount === undefined || req.query.src === undefined || req.query.dst === undefined) {
        res.json({
            error: 9876,
            errorMessage: "Invalid request structure. Required fields: amount, src and dst. ",
            exampleRequest: `${req.route.path}?amount=123&src=EUR&dst=USD`
        });
        return;
    }

    let currencies = await providerManager.currencyCodeList();
    if (currencies.error !== undefined || currencies.currencyCodes === undefined) {
        res.json({
            error: 7654,
            errorMessage: "Can't get list of currencies for request validation"
        });
        return;
    }

    if (!currencies.currencyCodes.includes(req.query.src) || !currencies.currencyCodes.includes(req.query.dst)) {
        res.json({
            error: 4653,
            errorMessage: "Values of 'src' and 'dst' must be from the list received from /api/statistics",
            exampleRequest: `${req.route.path}?amount=123&src=EUR&dst=USD`
        });
        return;
    }

    const result = await providerManager.convertWithBestProvider({ amount: req.query.amount, sourceCurrency: req.query.src, destinationCurrency: req.query.dst });

    if (result.error !== undefined) {
        res.json(result);
        return;
    }
    if (result.destinationAmount === undefined) {
        return {
            error: 6543,
            // TODO: add an error message
        };
    }
    statistics.updateStatistics({ amount: result.usdEquivalent, destinationCurrency: req.query.dst })
    let statData = statistics.getStatistics();
    if (statData.error !== undefined) statData = {};//TODO: here we discard the error so maybe we didn't need to generate it
    res.json({ destinationAmount: result.destinationAmount, statistics: statData });
});

app.get("/api/statistics", (req, res) => {
    console.log("serving", req.route.path);
    res.json(statistics.getStatistics());
    // TODO: If an error occurs statistics.js, we just forward it to frontend here.
    // In production it might be worth to filter the message here.
});

app.get("/api/currencyCodes", async (req, res) => {
    console.log("serving", req.route.path);
    let currencyCodeList = await providerManager.currencyCodeList();
    if (currencyCodeList.error !== undefined) {
        console.error("Can't get currency code list.");
        res.json({ error: 8765 });
        return;
    }
    res.json(currencyCodeList);
});

app.listen(CONFIG.backend.serverPort, () => {
    console.log("Server listening on", CONFIG.backend.serverPort);
});
