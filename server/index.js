const express = require("express");
const path = require("path");
const statistics = require("./statistics");
const calculator = require("./openexchangeratesClient.js");

const DEFAULT_PORT = 3000;
const port = process.argv[2] || DEFAULT_PORT;

const app = express();
calculator.logUsageInfo();

app.get("/", (req, res) => {
    console.log("serving", req.route.path);
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

var currencies = [];
app.post("/api/convert", async (req, res) => {
    console.log("serving", req.route.path, req.query);
    if (currencies.length === 0) {
        console.log("We need currency code list to validate the request but /api/currencyCodes was not called yet, getting now")
        currencies = await calculator.getCurrencyCodeList();
    }
    if (req.query.amount === undefined || req.query.src === undefined || req.query.dst === undefined
        || !currencies.includes(req.query.src) || !currencies.includes(req.query.dst)) {
        res.json({
            errorMessage: "Invalid request structure. Required fields: amount, src and dst. "
                + "Values of 'src' and 'dst' must be included frem the list received from /api/statistics",
            exampleRequest: `${req.route.path}?amount=123&src=EUR&dst=USD`
        });
        return;
    }
    const result = await calculator.convert({ amount: req.query.amount, sourceCurrency: req.query.src, destinationCurrency: req.query.dst });
    statistics.updateStatistics({ amount: result.usdEquivalent, destinationCurrency: req.query.dst })
    res.json({ destinationAmount: result.destinationAmount, statistics: statistics.getStatistics() });
});

app.get("/api/statistics", (req, res) => {
    console.log("serving", req.route.path);
    res.json(statistics.getStatistics());
});

app.get("/api/currencyCodes", async (req, res) => {
    console.log("serving", req.route.path);
    currencies = await calculator.getCurrencyCodeList();
    res.json({ currencyCodes: currencies });
});

app.listen(port, () => {
    console.log("Server listening on", port);
});
