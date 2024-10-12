// Import required libraries
const StellarSdk = require('stellar-sdk');
const fs = require('fs');
const csv = require('csv-parser');

// Dynamic import for node-fetch (ESM module)
(async () => {
    const fetch = (await import('node-fetch')).default;

    // Initialize Stellar SDK server for the testnet
    const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');

    // Function to request test XLM from the Stellar Friendbot
    async function requestTestXLM(publicKey) {
        try {
            const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
            const responseJSON = await response.json();
            console.log(`SUCCESS! Test XLM requested for ${publicKey}.\n`, responseJSON);
            return true;
        } catch (e) {
            console.error(`ERROR requesting XLM for ${publicKey}:`, e);
            return false;
        }
    }

    // Function to check the balance of an account
    async function checkBalance(publicKey) {
        try {
            const account = await server.loadAccount(publicKey);
            console.log(`Balances for account: ${publicKey}`);
            account.balances.forEach((balance) => {
                console.log('Type:', balance.asset_type, ', Balance:', balance.balance);
            });
        } catch (e) {
            console.error(`ERROR checking balance for ${publicKey}:`, e);
        }
    }

    // Function to process the CSV file and handle each wallet
    function processCSV(filename) {
        const wallets = [];

        // Read the CSV file
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (row) => {
                const publicKey = row['Public Key'];
                const secretKey = row['Secret Key'];
                wallets.push({ publicKey, secretKey });
            })
            .on('end', async () => {
                console.log('CSV file successfully processed.');
                // For each wallet, request test XLM and check balance
                for (const wallet of wallets) {
                    console.log(`Processing wallet: ${wallet.publicKey}`);
                    const testXLMRequested = await requestTestXLM(wallet.publicKey);
                    if (testXLMRequested) {
                        // Wait for a few seconds to allow the transaction to complete before checking the balance
                        setTimeout(async () => {
                            await checkBalance(wallet.publicKey);
                        }, 5000); // 5-second delay
                    }
                }
            });
    }

    // Start the process
    processCSV('stellar_keypair.csv');

})();
