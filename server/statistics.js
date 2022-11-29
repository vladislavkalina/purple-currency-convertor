const fs = require("fs");
const STORAGE_FILENAME = "statistics.data";//TODO: the format will be JSON so .json suffix would be more appropriate but it confuses nodemon so using .data for now
let statisticsData = { popularDestCurrencies: {}, numberOfRequest: 0, totalAmountCoverted: 0 };
let statisticsReady = false;

exports.updateStatistics = (parameters) => {
    console.log("Updating statistics", parameters);
    if (statisticsData.popularDestCurrencies[parameters.destinationCurrency] === undefined) {
        statisticsData.popularDestCurrencies[parameters.destinationCurrency] = 1
    } else {
        ++statisticsData.popularDestCurrencies[parameters.destinationCurrency];
    }
    statisticsData.numberOfRequest += 1;
    statisticsData.totalAmountCoverted += parameters.amount;

    if (statisticsReady) {
        storeValues();
    }
    return;
}

exports.getStatistics = () => {
    if (statisticsReady === false) {
        console.info("Reading from file not finished");
        return { error: true, errorMessage: "Statistics not ready yet" };
    }
    let mostPopularCurrency = null;
    let mostPopularNumber = -1;
    Object.keys(statisticsData.popularDestCurrencies).forEach((curr) => {
        if (statisticsData.popularDestCurrencies[curr] >= mostPopularNumber) {
            mostPopularNumber = statisticsData.popularDestCurrencies[curr];
            mostPopularCurrency = curr;
        }
    });
    return {
        mostPopularCurrencies: mostPopularCurrency,
        totalAmountConverted: statisticsData.totalAmountCoverted,
        numberOfRequestsMade: statisticsData.numberOfRequest
    };
}

function storeValues() {
    console.log("Storing updated statistic values");
    fs.writeFile(STORAGE_FILENAME, JSON.stringify(statisticsData), (err) => {
        if (err) {
            console.error("Error during saving statistics:", err);
        }
        console.log("Statistics stored");
    });
}

function loadValues() {
    fs.readFile(STORAGE_FILENAME, (err, data) => {
        if (err) {
            if (err.code === "ENOENT") {
                console.log("Storage file doesn't exist. That's expected behaviour for the 1st run. We'll start with zeros.");
            } else {
                console.error("Something else went wrong during reading the file.", err);
            }
            statisticsReady = true;
            return;
        }
        try {
            data = JSON.parse(data);
            // console.log("Statistic values from the previous run, loaded from file:", data);
            // console.log("Statistic values gathered since start, before values from the previous run were read from file.", statisticsData);
            if (data.numberOfRequest !== undefined && parseFloat(data.numberOfRequest) > 0) statisticsData.numberOfRequest += parseFloat(data.numberOfRequest);
            if (data.totalAmountCoverted !== undefined && parseFloat(data.totalAmountCoverted) > 0) statisticsData.totalAmountCoverted += parseFloat(data.totalAmountCoverted);
            Object.keys(data.popularDestCurrencies).forEach(key => {
                if (statisticsData.popularDestCurrencies[key] === undefined) {
                    statisticsData.popularDestCurrencies[key] = data.popularDestCurrencies[key];
                } else {
                    statisticsData.popularDestCurrencies[key] += data.popularDestCurrencies[key];
                }
            });
        } catch (e) {
            console.log("Error during decoding statistics:", e);
        }
        console.log("Statistics after loading values from the previous run", statisticsData);
        statisticsReady = true;
        storeValues();

    });
}

loadValues();
// setTimeout(loadValues, 5000); //to simulate delay in reading file