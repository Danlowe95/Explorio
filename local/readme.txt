run:
solana-test-validator

run:
cd anchor-explorio/local
# address of test wallet
solana airdrop 100 EA7Cpq8hfUxpHAQaQ1xy3hKaqEUSwQxXQijpZY6ZmJrU
bash generate_mints_config.sh
node build_rust_crate.js
# copy contents of rust_crate.txt into lib.rs file now
rm initialized_data.json
anchor test --skip-local-validator