import './App.css';
import React, { useEffect } from 'react'

function App() {
    const [currencyCodes, setCurrencyCodes] = React.useState(["[Loading...]"]);

    const [mostPopularCurrency, setMostPopularCurrency] = React.useState("[Loading...]");
    const [totalAmountConverted, setTotalAmountConverted] = React.useState("[Loading...]");
    const [numberOfConversionRequests, setNumberOfConversionRequests] = React.useState("[Loading...]");
    const [requestsRemaining, setRequestsRemaining] = React.useState("unknown");

    const [conversionResults, setConversionResults] = React.useState([]);

    const SOURCE_AMOUNT = "SRC_AMOUNT";
    const SOURCE_CURRENCY = "SRC_CURRENCY";
    const DESTINATION_CURRENCY = "DST_CURRENCY";

    useEffect(() => {
        const fetchCurrencyCodes = async () => {
            const resp = await fetch("/api/currencyCodes");
            try {
                const decodedResp = await resp.json();
                if (decodedResp.error !== undefined || decodedResp.currencyCodes === undefined) {
                    alert(`We're sorry, our server didn't feel good while providing the list of currency codes. Please contact technical support. Code: ${decodedResp.error}`);
                    return;
                }
                setCurrencyCodes(decodedResp.currencyCodes);
            } catch (e) {
                alert(`We're sorry, our server didn't feel good while providing the list of currency codes. Please contact technical support (currency codes).`);
                return;
            }
        }
        fetchCurrencyCodes()
            .catch(console.error);
    }, []);

    useEffect(() => {
        const fetchStatistics = async () => {
            const resp = await fetch("/api/statistics");
            try {
                const decodedResp = await resp.json();
                if (decodedResp.error !== undefined) {
                    console.error("Backend didn't provide statistics", decodedResp);
                    return;
                }
                // console.log(decodedResp)
                setMostPopularCurrency(decodedResp.mostPopularCurrencies);
                setTotalAmountConverted(decodedResp.totalAmountConverted);
                setNumberOfConversionRequests(decodedResp.numberOfRequestsMade);
            } catch (e) {
                console.error("Backend didn't provide statistics:", e);
                return;
            }
        }
        fetchStatistics()
            .catch(console.error);
    }, []);

    const handleConvertClick = async (event) => {
        let amount = document.getElementById("amount").value;
        let srcCurrency = document.getElementById("srcCurrency").value;
        let dstCurrency = document.getElementById("dstCurrency").value;
        if (srcCurrency === dstCurrency) {
            alert("We are sorry, source and destination currency can't be equal.");
            return;
        }
        try {
            localStorage.setItem(SOURCE_AMOUNT, amount);
            localStorage.setItem(SOURCE_CURRENCY, srcCurrency);
            localStorage.setItem(DESTINATION_CURRENCY, dstCurrency);
            const response = await fetch(`/api/convert?amount=${amount}&src=${srcCurrency}&dst=${dstCurrency}`, { method: 'POST' });
            if (!response.ok) {
                console.error(`Error on conversion request: ${response.status}`);
                alert("We are sorry but an error occured in communication with our server.\nPlease contact technical support.\nCode: 1234");
                return;
            }
            const responseDecoded = await response.json();
            if (responseDecoded.error !== undefined) {
                console.error(`Error on recoding conversion response: ${responseDecoded}`);
                alert(`We are sorry but an error occured in communication with our server.\nPlease contact technical support.\nCode: ${responseDecoded.error}`);
            }
            setConversionResults(conversionResults.concat(`${amount} ${srcCurrency} is ${responseDecoded.destinationAmount} ${dstCurrency}`));
            setMostPopularCurrency(responseDecoded.statistics.mostPopularCurrencies || "unknown");
            setTotalAmountConverted(responseDecoded.statistics.totalAmountConverted || "unknown");
            setNumberOfConversionRequests(responseDecoded.statistics.numberOfRequestsMade || "unknown");
            setRequestsRemaining(responseDecoded.statistics.requestsRemaining || "unknown");
        } catch (e) {
            console.error("Error", e);
            alert("We are sorry but an error occured in decoding a response from our server.\nPlease contact technical support.\nCode: 2345");
        }
    }

    let defaultAmount = localStorage.getItem(SOURCE_AMOUNT) || 1;
    let defaultSourceCurrency = localStorage.getItem(SOURCE_CURRENCY);
    let defaultDestinationCurrency = localStorage.getItem(DESTINATION_CURRENCY);

    return (
        <div className="App">
            <h1>Purple Currency Convertor</h1>
            {currencyCodes.length <= 1 ?
                <div>Loading...</div>
                :
                <>

                    <input id={"amount"} type={"number"} defaultValue={defaultAmount} />

                    <select key="srcCurrency" id="srcCurrency" defaultValue={defaultSourceCurrency}>
                        {currencyCodes.map(code => {
                            return <option key={"src" + code}>{code}</option>
                        })}
                    </select>
                    &nbsp;to&nbsp;
                    <select key="dstCurrency" id="dstCurrency" defaultValue={defaultDestinationCurrency}>
                        {currencyCodes.map(code => {
                            return <option key={"dst" + code}>{code}</option>
                        })}
                    </select>
                    <button onClick={handleConvertClick}>Convert!</button>

                    <div>
                        <h2>Results:</h2>
                        {conversionResults.map((item, index) => {
                            return <div key={"result" + index}>{item}</div>
                        })}
                    </div>

                    <div>
                        <h2>Statistics:</h2>
                        <div>
                            <span className={"statItem"}>Most popular destination currency:</span>
                            <span>{mostPopularCurrency}</span>
                        </div>
                        <div>
                            <span className={"statItem"}>Total amount converted:</span>
                            <span>{totalAmountConverted}</span> USD
                        </div>
                        <div>
                            <span className={"statItem"}>Total number of conversion requests made:</span>
                            <span>{numberOfConversionRequests}</span>
                        </div>
                        <div>
                            <span className={"statItem"}>Number of remaining conversions:</span>
                            <span>{requestsRemaining}</span>
                        </div>
                    </div >
                </>
            }
        </div >
    );
}

export default App;
