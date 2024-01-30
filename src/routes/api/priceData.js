// Import necessary modules
import algosdk from 'algosdk';
import Contract from 'swap200js';

// Define constants and initializations
const appIdHumble = 24590736; // Humble App ID
const appIdNomadex = 24589652; // Nomadex App ID
const appIdVia = 6779767; // VIA App ID
const algodToken = ''; // Your algod token here
const algodServer = 'https://testnet-api.voi.nodly.io/'; // Algod server URL
const address = 'JNWUE4WAJEIL2NH3LLD2TLYGAQH6QZENLLNFZKWM454DANQQC6ZBTTA2HQ'; // Your address

const algodClient = new algosdk.Algodv2(algodToken, algodServer, '');

// Function to get information from Humble LP
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
                Price: price.toString()
            };
        }
    } catch (error) {
        console.error('Error getting Humble LP info:', error);
        throw error;
    }
}

// Function to get information from Nomadex LP
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
            Price: price.toString()
        };
    } catch (error) {
        console.error('Error getting Nomadex LP info:', error);
        throw error;
    }
}

// Main serverless function
export default async function(req, res) {
    try {
        const humbleLPInfo = await getHumbleLPInfo();
        const nomadexLPInfo = await getNomadexLPInfo();
        
        // Set CORS headers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        // Send the response
        res.status(200).json({
            humbleLPInfo, 
            nomadexLPInfo,
            // Include priceHistory if it's needed in the response
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
}
