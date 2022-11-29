const fs = require("fs");
const STORAGE_FILENAME = "statistics.data";//TODO: the format will be JSON so .json suffix would be more appropriate but it confuses nodemon so using .data for now
let statisticsData = { popularDestCurrencies: {}, numberOfRequest: 0, totalAmountCoverted: 0 };
let statisticsReady = false;

exports.updateStatistics = (parameters) => {
    console.log("updating statistics", parameters);
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
        console.log("reading from file not finished");
        return { "errorMessage": "Statistics not ready yet" };
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
    console.log("storing updated statistic values...");
    fs.writeFile(STORAGE_FILENAME, JSON.stringify(statisticsData), (err) => {
        if (err) {
            console.error("Error during saving statistics:", err);
        }
        console.log("statistics stored");
    });
}

function loadValues() {
    console.log("loading values...");
    fs.readFile(STORAGE_FILENAME, (err, data) => {
        if (err) {
            console.error("Error during reading statistics:", err);
            statisticsReady = true;
            return;
        }
        try {
            data = JSON.parse(data);
            console.log("values loaded from storage", data);
            console.log("values gathered before loading from file, need to be added to those loaded from storage", statisticsData);
            if (data.numberOfRequest !== undefined) statisticsData.numberOfRequest += parseInt(data.numberOfRequest);
            if (data.totalAmountCoverted !== undefined) statisticsData.totalAmountCoverted += parseInt(data.totalAmountCoverted);
            Object.keys(data.popularDestCurrencies).forEach(key => {
                if (statisticsData.popularDestCurrencies[key] === undefined) {
                    statisticsData.popularDestCurrencies[key] = data.popularDestCurrencies[key];
                } else {
                    statisticsData.popularDestCurrencies[key] += data.popularDestCurrencies[key];
                }
            });
        } catch (e) {
            console.log("Error during decoding statistics:", e);
            statisticsReady = true;
            return;
        }
        console.log("statistics loaded", statisticsData);
        statisticsReady = true;
        storeValues();

    });
}

// loadValues();
setTimeout(loadValues, 5000); //to simulate delay in reading file