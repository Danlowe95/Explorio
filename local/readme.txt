run:
solana-test-validator

run:
cd anchor-explorio
# address of test wallet

## TODO what is EA7 linked to??
solana airdrop 100 78aJYueV3cvCDJBZwSuqimnRBqAqihqSchxpmy4K6mXN
bash local/generate_mints_config.sh
node local/build_rust_crate.js
# copy contents of rust_crate.txt into lib.rs file now
cat local/rust_crate.txt

#
rm local/initialized_data.json
rm local/initialized_accounts.json
anchor test --skip-local-validator

