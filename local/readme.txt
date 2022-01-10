run:
solana-test-validator

run:
cd anchor-explorio/local
# address of test wallet
solana airdrop 100 EA7Cpq8hfUxpHAQaQ1xy3hKaqEUSwQxXQijpZY6ZmJrU
bash generate_mints_config.sh
cp mint_config.json env.json and re-save (TBD fix this)