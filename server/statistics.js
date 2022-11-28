const fs = require("fs");
const STORAGE_FILENAME = "statistics.data";//TODO: the format will be JSON so .json suffix would be more appropriate but it confuses nodemon so using .data for now
let statisticsData = { popularDestCurrencies: {}, numberOfRequest: 0, totalAmountCoverted: 0 };

exports.updateStatistics = (parameters) => {
    //TODO: we need to make sure that the values are already loaded
    console.log("updating statistics", parameters);
    if (statisticsData.popularDestCurrencies[parameters.destinationCurrency] === undefined) {
        statisticsData.popularDestCurrencies[parameters.destinationCurrency] = 1
    } else {
        ++statisticsData.popularDestCurrencies[parameters.destinationCurrency];
    }
    statisticsData.numberOfRequest += 1;
    statisticsData.totalAmountCoverted += parameters.amount;

    setTimeout(storeValues, 0);
    return;
}

exports.getStatistics = () => {
    //TODO: we need to make sure that the values are already loaded
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
    console.log("storing statistics values...");
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
            return;
        }
        try {
            statisticsData = JSON.parse(data);
        } catch (e) {
            console.log("Error during decoding statistics:", e);
            return;
        }
        console.log("statistics loaded", statisticsData);
    });
}

loadValues();