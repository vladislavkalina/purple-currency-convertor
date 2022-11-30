import './App.css';
import React, { useEffect } from 'react'

function App() {
    const [currencyCodes, setCurrencyCodes] = React.useState(["[Loading...]"]);

    const [mostPopularCurrency, setMostPopularCurrency] = React.useState("[Loading...]");
    const [totalAmountConverted, setTotalAmountConverted] = React.useState("[Loading...]");
    const [numberOfConversionRequests, setNumberOfConversionRequests] = React.useState("[Loading...]");

    const [conversionResults, setConversionResults] = React.useState([]);

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
                    alert(`We're sorry, our server didn't feel good while providing the list of currency codes. Please contact technical support. Code: ${decodedResp.error}`);
                    return;
                }
                // console.log(decodedResp)
                setMostPopularCurrency(decodedResp.mostPopularCurrencies);
                setTotalAmountConverted(decodedResp.totalAmountConverted);
                setNumberOfConversionRequests(decodedResp.numberOfRequestsMade);
            } catch (e) {
                alert(`We're sorry, our server didn't feel good while providing the list of currency codes. Please contact technical support (currency codes).`);
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
            setMostPopularCurrency(responseDecoded.statistics.mostPopularCurrencies);
            setTotalAmountConverted(responseDecoded.statistics.totalAmountConverted);
            setNumberOfConversionRequests(responseDecoded.statistics.numberOfRequestsMade);
        } catch (e) {
            console.error("Error", e);
            alert("We are sorry but an error occured in decoding a response from our server.\nPlease contact technical support.\nCode: 2345");
        }
    }

    return (
        <div className="App">
            <h1>Purple Currency Convertor</h1>

            <input id={"amount"} type={"number"} defaultValue={0} />

            <select key="srcCurrency" id="srcCurrency">
                {currencyCodes.map(code => {
                    return <option key={"src" + code}>{code}</option>
                })}
            </select>
            &nbsp;to&nbsp;
            <select key="dstCurrency" id="dstCurrency">
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
            </div >
        </div >
    );
}

export default App;
