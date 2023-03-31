run:
solana-test-validator

run:
cd anchor-explorio
# address of test wallet

# this is the address of the OWNER, who is the only one allowed to initialize the program.
# defined in lib.rs 
solana airdrop 100 78aJYueV3cvCDJBZwSuqimnRBqAqihqSchxpmy4K6mXN
bash local/generate_mints_config.sh
node local/build_rust_crate.js
cat local/rust_crate.txt

# copy output of the cat into lib.rs file now. then run the below

rm local/initialized_data.json
rm local/initialized_accounts.json
anchor test --skip-local-validator

