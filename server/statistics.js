let destinationCurrencies = "n/a";
let numberOfRequest = 0;
let totalAmountCoverted = 0;

exports.updateStatistics = (parameters) => {
    console.log("updating statistics", parameters);
    destinationCurrencies = parameters.destinationCurrency;
    numberOfRequest += 1;
    totalAmountCoverted += parameters.amount;
    return;
}

exports.getStatistics = () => {
    return {
        mostPopularCurrencies: destinationCurrencies,
        totalAmountConverted: totalAmountCoverted,
        numberOfRequestsMade: numberOfRequest
    };
}
