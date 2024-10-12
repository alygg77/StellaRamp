const StellarSdk = require('stellar-sdk');
const csv = require('csv-parser');
const path = require('path');
const fs = require('fs');

// Initialize the Stellar Horizon server (testnet)
var server = new StellarSdk.Horizon.Server(
    "https://horizon-testnet.stellar.org",
);



// Function to read CSV file and extract keypair
async function getKeypairFromCSV() {
    return new Promise((resolve, reject) => {
        const results = [];

        // Get the path to the stellar_keypair.csv file (adjust the path as needed)
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

// Function to send assets
async function Send(fromSecretKey, toPublicKey, amount, assetCode = 'XLM', assetIssuer = null) {
    try {
        // Initialize source and destination keypairs
        const sourceKeypair = StellarSdk.Keypair.fromSecret(fromSecretKey);
        const destinationId = toPublicKey;

        // Load destination account to ensure it exists
        await server.loadAccount(destinationId).catch((error) => {
            if (error instanceof StellarSdk.NotFoundError) {
                throw new Error('The destination account does not exist!');
            } else {
                throw error;
            }
        });

        // Load source account
        const sourceAccount = await server.loadAccount(sourceKeypair.publicKey());

        // Determine the asset to send
        let asset;
        if (assetCode === 'XLM' && assetIssuer === null) {
            // Native asset (Lumens)
            asset = StellarSdk.Asset.native();
        } else {
            // Custom asset
            asset = new StellarSdk.Asset(assetCode, assetIssuer);
        }

        // Build the transaction
        const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
            fee: StellarSdk.BASE_FEE,
            networkPassphrase: StellarSdk.Networks.TESTNET,
        })
            .addOperation(
                StellarSdk.Operation.payment({
                    destination: destinationId,
                    asset: asset,
                    amount: amount.toString(),
                })
            )
            .addMemo(StellarSdk.Memo.text('Transaction Memo'))
            .setTimeout(180)
            .build();

        // Sign the transaction
        transaction.sign(sourceKeypair);

        // Submit the transaction
        const result = await server.submitTransaction(transaction);
        console.log('Transaction successful!', result);
    } catch (error) {
        console.error('Error during transaction:', error);
    }
}

// Example usage
(async () => {
    // Get the keypair from CSV (assuming the 'from' account is stored there)
    const { publicKey, secretKey } = await getKeypairFromCSV();

    // Define parameters
    const fromSecretKey = secretKey; // Secret key of the sender
    const toPublicKey = 'GCCUGGJ6ZIKL2YHCB2IZPCCXF52AURCOWGL3UCDPNWY5CSS5GRLD3XKK'; // Recipient's public key
    const amount = '1000'; // Amount to send
    const assetCode = 'TANTOK'; // Asset code ('XLM' for native Lumens)
    const assetIssuer = 'GCCUGGJ6ZIKL2YHCB2IZPCCXF52AURCOWGL3UCDPNWY5CSS5GRLD3XKK'; // Asset issuer (null for native asset)

    // Call the Send function
    await Send(fromSecretKey, toPublicKey, amount, assetCode, assetIssuer);
})();
