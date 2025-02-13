function getCookie(name) {
    let cookies = document.cookie.split('; ');
    for (let cookie of cookies) {
        let [key, ...valueParts] = cookie.split('='); // Handle '=' in value
        if (key === name) {
            return valueParts.join('='); // Preserve `=` in Base64 encoded values
        }
    }
    return null;
}

async function fetchHoldings() {
    const enctoken = getCookie('enctoken'); // Retrieve enctoken from cookies
    if (!enctoken) {
        console.error("enctoken not found in cookies");
        return;
    }

    try {
        const response = await fetch('/oms/portfolio/holdings', {
            method: 'GET',
            headers: {
                'Authorization': `enctoken ${enctoken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching holdings:", error);
    }
}


// Store holdings in a variable
async function storeHoldings() {
    let holdingsData = await fetchHoldings();
    console.log("Holdings Data Stored:", holdingsData);
    return holdingsData; // You can now use this elsewhere
}

function getGTTs() {
    // Select all cards within the 'gtt-list cards' div
    const cards = document.querySelectorAll(".gtt-list-section  .instrument .tradingsymbol");

    // Extract stock names
    const stockNames = Array.from(cards).map(card =>
        card.innerText
    ).filter(name => name); // Remove any null or undefined values

    return stockNames;
}


async function checkGTTInHoldings() {
    const gttStockNames = await getGTTs(); // Get stock names from GTT orders
    const holdingsData = await storeHoldings(); // Fetch holdings data
	console.log("gttStocknames", gttStockNames);
  
    // Extract stock names from holdingsData (assuming it contains objects with a stockName property)
    const holdingsStockNames = holdingsData.data.map(holding => holding.tradingsymbol);

    // Filter stocks that are present in holdings
    const matchedStocks = gttStockNames.filter(stock => holdingsStockNames.includes(stock));
	console.log("Matched stocks = ", matchedStocks);
    return matchedStocks; // Return the list of matching stock names
}
checkGTTInHoldings().then(data => {
    // Convert string to array
    document.querySelectorAll('.gtt-list-section .instrument .tradingsymbol').forEach(card => {
        const stockNameElement = card;
        const stockName = stockNameElement.innerText.trim(); 
        
        if (data.includes(stockName)){
            const briefcaseIcon = document.createElement('span');
            briefcaseIcon.className = 'icon icon-briefcase';
            console.log(`Adding the icon to: ${stockName}`);
            stockNameElement.appendChild(briefcaseIcon);
        }
      else 
      {
            console.log("data does not match with stockName", data, stockName);
      }
    });
});
    
