run:
solana-test-validator

run:
cd anchor-explorio
# address of test wallet
solana airdrop 100 EA7Cpq8hfUxpHAQaQ1xy3hKaqEUSwQxXQijpZY6ZmJrU
bash local/generate_mints_config.sh
node local/build_rust_crate.js
# copy contents of rust_crate.txt into lib.rs file now
cat local/rust_crate.txt
#
rm local/initialized_data.json
rm local/initialized_accounts.json
anchor test --skip-local-validator
