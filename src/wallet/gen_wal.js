// Import required libraries
const StellarSdk = require('stellar-sdk');
const fs = require('fs');

// Function to generate a Stellar keypair
function generateStellarKeypair() {
    // Generate a random keypair
    const keypair = StellarSdk.Keypair.random();

    // Extract public and secret keys
    const publicKey = keypair.publicKey();
    const secretKey = keypair.secret();

    // Return the keypair
    return { publicKey, secretKey };
}

// Function to append keypair data to a CSV file
function appendKeypairToCSV(keypair, filename = 'stellar_keypair.csv') {
    // Check if the file exists
    const fileExists = fs.existsSync(filename);

    // If the file doesn't exist, add the header
    let header = '';
    if (!fileExists) {
        header = 'Public Key,Secret Key\n';
    }

    // CSV data to append (no header if the file exists)
    const data = `${keypair.publicKey},${keypair.secretKey}\n`;

    // Append the data (and header if necessary) to the CSV file
    fs.appendFileSync(filename, header + data, 'utf8');
    console.log(`New keypair appended to ${filename}`);
}

// Generate the keypair
const keypair = generateStellarKeypair();

// Append the keypair to the CSV file
appendKeypairToCSV(keypair);
