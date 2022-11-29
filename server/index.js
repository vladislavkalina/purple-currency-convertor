const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const statistics = require("./statistics");
const calculator = require("./openexchangeratesClient.js");

const DEFAULT_PORT = 3000;
const port = process.argv[2] || DEFAULT_PORT;

const app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false })
calculator.logUsageInfo();

app.get("/", (req, res) => {
    console.log("serving", req.route.path);
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.post("/api/convert", urlencodedParser, async (req, res) => {
    console.log("serving", req.route.path);
    if (req.body === undefined) {
        res.json({ errorMessage: "We could not parse the request." });
        return;
    }
    const result = await calculator.convert(req.body);
    statistics.updateStatistics({ amount: result.usdEquivalent, destinationCurrency: req.body.destinationCurrency })
    res.json({ destinationAmount: result.destinationAmount, statistics: statistics.getStatistics() });
});

app.get("/api/statistics", (req, res) => {
    console.log("serving", req.route.path);
    res.json(statistics.getStatistics());
});

app.get("/api/currencyCodes", async (req, res) => {
    console.log("serving", req.route.path);
    let currencies = await calculator.getCurrencyCodeList();
    res.json({ currencyCodes: currencies });
});

app.listen(port, () => {
    console.log("Server listening on", port);
});
