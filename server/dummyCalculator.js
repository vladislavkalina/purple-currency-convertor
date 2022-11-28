exports.getCurrencyCodeList = function getCurrencyCodeList() {
    return ["CZK", "EUR", "USD"];
}

exports.convert = function convert(parameters) {
    console.log("converting", parameters.amount, parameters.sourceCurrency, "to", parameters.destinationCurrency);
    return {
        destinationAmount: 10 * parameters.amount,
        usdEquivalent: 20 * parameters.amount
    };
}
