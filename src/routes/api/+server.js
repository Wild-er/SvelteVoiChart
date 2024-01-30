// src/routes/api/+server.js
import algosdk from 'algosdk';
import Contract from 'swap200js';

const appIdHumble = 24590736; // Humble App ID
const appIdNomadex = 24589652; // Nomadex App ID
const appIdVia = 6779767;
const algodToken = ''; // Your algod token here
const algodServer = 'https://testnet-api.voi.nodly.io/';
const address = 'JNWUE4WAJEIL2NH3LLD2TLYGAQH6QZENLLNFZKWM454DANQQC6ZBTTA2HQ';

let priceHistory = [];

const algodClient = new algosdk.Algodv2(algodToken, algodServer, '');

async function getHumbleLPInfo() {
    const contractHumble = new Contract(appIdHumble, algodClient, algodClient);
    try {
        const infoResponse = await contractHumble.Info();
        if (infoResponse.success) {
            const [, poolBals] = infoResponse.returnValue;
            const price = Number(poolBals[1]) / Number(poolBals[0]);
            return {
                wVoi: poolBals[0].toString(),
                Via: poolBals[1].toString(),
                Price: price.toString() // Convert the price to a string
            };
        }
    } catch (error) {
        console.error('Error getting Humble LP info:', error);
        throw error;
    }
}

async function getNomadexLPInfo() {
    const initContract = (appIdVia, algodClient) => {
        return new Contract(appIdVia, algodClient, algodClient);
    };
    try {
        const contract = initContract(appIdVia, algodClient);
        const balanceResponse = await contract.arc200_balanceOf(address);
        const accountInfo = await algodClient.accountInformation(address).do();
        const price = Number(balanceResponse.returnValue) / Number(accountInfo.amount);
        return {
            Voi: accountInfo.amount.toString(),
            Via: balanceResponse.returnValue.toString(),
            Price: price.toString() // Convert the price to a string
        };
    } catch (error) {
        console.error('Error getting Nomadex LP info:', error);
        throw error;
    }
}

async function fetchAndStorePrices() {
    try {
        const humbleLPInfo = await getHumbleLPInfo();
        const nomadexLPInfo = await getNomadexLPInfo();

        addToPriceHistory('Humble', humbleLPInfo.Price);
        addToPriceHistory('Nomadex', nomadexLPInfo.Price);

        console.log("Updated Price History:", priceHistory); // Logging inside the function
    } catch (error) {
        console.error('Error fetching and storing prices:', error);
    }
}

// Schedule the task to run every minute
setInterval(fetchAndStorePrices, 60000); // 60,000 milliseconds = 1 minute

function addToPriceHistory(dex, price) {
    const timestamp = Date.now();
    priceHistory.push({ dex, price, timestamp });

    // Optionally limit the history size (e.g., last 1440 entries for 1 day at 1-min intervals)
    if (priceHistory.length > 1440) {
        priceHistory.shift();
    }
}

console.log(priceHistory)

export async function GET({ request }) {
    try {
        const humbleLPInfo = await getHumbleLPInfo();
        const nomadexLPInfo = await getNomadexLPInfo();

        // Set CORS headers
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        // Allow all origins - for specific origins, replace '*' with the origin URL
        headers.append('Access-Control-Allow-Origin', '*');
        // You can add other CORS headers if needed
        headers.append('Access-Control-Allow-Methods', 'GET, OPTIONS');
        headers.append('Access-Control-Allow-Headers', 'Content-Type');

        return new Response(JSON.stringify({ 
            humbleLPInfo, 
            nomadexLPInfo,
            priceHistory // Include the price history in the response
        }), {
            status: 200,
            headers: headers
        });
    } catch (error) {
        console.error('Error in server-side route:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}
