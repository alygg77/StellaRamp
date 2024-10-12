const StellarSdk = require('stellar-sdk');  // ensure you're using the correct SDK

// Adjusted: Access StellarSdk.default.Server if needed based on version
const server = new StellarSdk.Horizon.Server(
    "https://horizon-testnet.stellar.org",
); // Testnet

// Function to read CSV file and extract keypair
async function getKeypairFromCSV() {
    return new Promise((resolve, reject) => {
        const results = [];
        const path = require('path');
        const fs = require('fs');
        const csv = require('csv-parser');

        // Get the path to the stellar_keypair.csv file two directories above
        const csvFilePath = path.join(__dirname, 'stellar_keypair.csv');

        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                if (results.length > 0) {
                    const publicKey = results[0]['Public Key'];
                    const secretKey = results[0]['Secret Key'];
                    resolve({ publicKey, secretKey });
                } else {
                    reject('No keypair found in CSV');
                }
            })
            .on('error', reject);
    });
}

// Issue an asset and send max supply to the creator
async function issueAsset(assetName, maxSupply) {
    try {
        // Get the keypair from CSV
        const { publicKey, secretKey } = await getKeypairFromCSV();

        // Load the account of the issuer
        const issuerKeypair = StellarSdk.Keypair.fromSecret(secretKey);
        const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());

        // Create a new asset
        const asset = new StellarSdk.Asset(assetName, issuerKeypair.publicKey());

        // Build a transaction to issue the asset
        const transaction = new StellarSdk.TransactionBuilder(issuerAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
            .addOperation(
                StellarSdk.Operation.payment({
                    destination: issuerKeypair.publicKey(),
                    asset: asset,
                    amount: maxSupply.toString(), // all max supply to the creator
                })
            )
            .setTimeout(30)
            .build();

        // Sign the transaction with the issuer's secret key
        transaction.sign(issuerKeypair);

        // Submit the transaction to the Stellar network
        const transactionResult = await server.submitTransaction(transaction);
        console.log('Asset issued successfully:', transactionResult);
    } catch (error) {
        console.error('Error issuing asset:', error);
    }
}

// Input asset name and max supply
const assetName = 'TANTOK';  // Replace with your asset name
const maxSupply = '1000000000';          // Replace with the max supply

issueAsset(assetName, maxSupply);
