First, we need to create token we are going to issue, tokenize.
Prereqs:
Create two private keys in stellar.
cd token
stellar contract build
stellar contract install --wasm target/wasm32-unknown-unknown/release/soroban_token_contract.wasm --source alice --network testnet
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/soroban_token_contract.wasm --source alice --network testnet

Here you get response similar to that:

'ℹ️ Skipping install because wasm already installed
ℹ️ Using wasm hash 27779ad81532dc490a6e7e64efad10d671661e348558e8dcf048068779c62074
ℹ️ Simulating deploy transaction…
🌎 Submitting deploy transaction…
ℹ️ Transaction hash is 333e05a085904ec28fea357e4407f4af87fb1dac2e740968b033b4820e990801
🔗 https://stellar.expert/explorer/testnet/tx/333e05a085904ec28fea357e4407f4af87fb1dac2e740968b033b4820e990801
🔗 https://stellar.expert/explorer/testnet/contract/CCJKDEFRTGOP7JKPGN6B5OHRIG56UH3I3XVNFYTZTJNBFCGBWPZZVA4Z
✅ Deployed!
CCJKDEFRTGOP7JKPGN6B5OHRIG56UH3I3XVNFYTZTJNBFCGBWPZZVA4Z'

Save wasm hash here, it will be needed in creating liquid pools and adding liquidity.

Here, source account is private key, admin is public key. For two tokens you should use differnt admins
stellar contract invoke --id CCJKDEFRTGOP7JKPGN6B5OHRIG56UH3I3XVNFYTZTJNBFCGBWPZZVA4Z --source-account SCW7AWQJCPLPTAZGPHWWIEVWA2N2R32GWNJZM75Q2HT6UI5FNYQYW3JD --network testnet -- initialize --admin GCCUGGJ6ZIKL2YHCB2IZPCCXF52AURCOWGL3UCDPNWY5CSS5GRLD3XKK --decimal 8 --name token_test_a --symbol tkna
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/soroban_token_contract.wasm --source alice --network testnet
For this one, private key is the key you used before, but public key is from the second wallet
stellar contract invoke --id CCGOIKDIM7L7SFQV4EU2BIKCGVBF56NKILP5YSINMDSC2D3HEFCFUTSN --source-account SCW7AWQJCPLPTAZGPHWWIEVWA2N2R32GWNJZM75Q2HT6UI5FNYQYW3JD --network testnet -- initialize --admin GAICQVUPUUMLLXU6QMUWEVWZYXNWE4KPNV3Y4CWCCVM4T7GFJGORARNC --decimal 8 --name token_test_b --symbol tknb

Then mint tokens and send to first public key:
stellar contract invoke --id CCJKDEFRTGOP7JKPGN6B5OHRIG56UH3I3XVNFYTZTJNBFCGBWPZZVA4Z --source-account SCW7AWQJCPLPTAZGPHWWIEVWA2N2R32GWNJZM75Q2HT6UI5FNYQYW3JD --network testnet -- mint --to GCCUGGJ6ZIKL2YHCB2IZPCCXF52AURCOWGL3UCDPNWY5CSS5GRLD3XKK --amount 100000
stellar contract invoke --id CCGOIKDIM7L7SFQV4EU2BIKCGVBF56NKILP5YSINMDSC2D3HEFCFUTSN --source-account SBHEBBSB4O7M33ACFWIXNAOCDP6LYHSGVDEULBPWJBAGW5CWOUHF7ISM --network testnet -- mint --to GC
CUGGJ6ZIKL2YHCB2IZPCCXF52AURCOWGL3UCDPNWY5CSS5GRLD3XKK --amount 10000 


Congratulations! You have successfully(luckily) created issuance token.
Now let's add to liquid pool
cd ..
cd liquidity_pool
stellar contract build
stellar contract install --wasm target/wasm32-unknown-unknown/release/soroban_liquidity_pool_contract.wasm --source alice --network testnet
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/soroban_liquidity_pool_contract.wasm --source alice --network testnet
Copy what follows after Deployed!
CDDL3VROQXFD25SHLJA2IKV7EX5KTTA4JCB5CS2ST4HGIAZMXXFHOF4M
LP init:
stellar contract invoke --id CDDL3VROQXFD25SHLJA2IKV7EX5KTTA4JCB5CS2ST4HGIAZMXXFHOF4M --source-account SCW7AWQJCPLPTAZGPHWWIEVWA2N2R32GWNJZM75Q2HT6UI5FNYQYW3JD --network testnet -- initialize --token_wasm_hash 27779ad81532dc490a6e7e64efad10d671661e348558e8dcf048068779c62074  --token_a CCGOIKDIM7L7SFQV4EU2BIKCGVBF56NKILP5YSINMDSC2D3HEFCFUTSN --token_b CCJKDEFRTGOP7JKPGN6B5OHRIG56UH3I3XVNFYTZTJNBFCGBWPZZVA4Z
Add liquidity:
stellar contract invoke --id CDDL3VROQXFD25SHLJA2IKV7EX5KTTA4JCB5CS2ST4HGIAZMXXFHOF4M --source-account SCW7AWQJCPLPTAZGPHWWIEVWA2N2R32GWNJZM75Q2HT6UI5FNYQYW3JD --network testnet -- deposit --to GCCUGGJ6ZIKL2YHCB2IZPCCXF52AURCOWGL3UCDPNWY5CSS5GRLD3XKK --desired_a 100 --min_a 98 --desired_b 200 --min_b 196
Congratulations! You have added lp to a liquid pool

////
stellar contract invoke --id CDPPJRBAFMYXMPKNVOT7FZ6HYRGJDBGKCR4ZBJUFW3Y7LZXVGV7O3EE6 --source-account SCW7AWQJCPLPTAZGPHWWIEVWA2N2R32GWNJZM75Q2HT6UI5FNYQYW3JD --network testnet -- initialize --token_wasm_hash 27779ad81532dc490a6e7e64efad10d671661e348558e8dcf048068779c62074  --token_a CA4HHVFUKD4TTJX7URMLFFPSEDKB7OTZMWHRYNO4JTGM7K4LQL3Q635Y --token_b CC4HZMV6HBBQH2NTT77OWK65TZKM3ONFLUV3RIP5DZIG5IPBE7IISDGM
stellar contract invoke --id CDPPJRBAFMYXMPKNVOT7FZ6HYRGJDBGKCR4ZBJUFW3Y7LZXVGV7O3EE6 --source-account SCW7AWQJCPLPTAZGPHWWIEVWA2N2R32GWNJZM75Q2HT6UI5FNYQYW3JD --network testnet -- deposit --to GCCUGGJ6ZIKL2YHCB2IZPCCXF52AURCOWGL3UCDPNWY5CSS5GRLD3XKK --desired_a 50000000000000000 --min_a 45000000000000000 --desired_b 3000000000000 --min_b 2000000000000
stellar contract invoke --id CC4HZMV6HBBQH2NTT77OWK65TZKM3ONFLUV3RIP5DZIG5IPBE7IISDGM --source-account SBHEBBSB4O7M33ACFWIXNAOCDP6LYHSGVDEULBPWJBAGW5CWOUHF7ISM --network testnet -- mint --to GCCUGGJ6ZIKL2YHCB2IZPCCXF52AURCOWGL3UCDPNWY5CSS5GRLD3XKK --amount 5000000000000000
////

Swap:
stellar contract invoke --id CDPPJRBAFMYXMPKNVOT7FZ6HYRGJDBGKCR4ZBJUFW3Y7LZXVGV7O3EE6 --source-account SCW7AWQJCPLPTAZGPHWWIEVWA2N2R32GWNJZM75Q2HT6UI5FNYQYW3JD --network testnet -- swap --to GCCUGGJ6ZIKL2YHCB2IZPCCXF52AURCOWGL3UCDPNWY5CSS5GRLD3XKK --buy_a true --out 100000000000000 --in_max 1000000000000000

