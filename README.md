# Explorio

This project's purpose is to explore blockchain technology, specifically by developing a Solana Program using the [Anchor framework](https://book.anchor-lang.com/introduction/what_is_anchor.html).

The protocol's name is Explorio, and is an experiment in creating real value for NFTs through a non-interactive game protocol which drives users to use both fungible and non-fungible tokens (NFTs) to engage with the protocol, the marketplace, and through these two pathways create a small but functional economy around the game’s assets.

## Quick look
A non-functional version of the frontend has been deployed using netlify, and [can be accessed here](https://mellow-florentine-7a7c89.netlify.app/). Wallet functionality works, but the hunt simulation will require standing up a local solana validator and deploying the anchor program with proper parameters.
<img src="local/quick-look.png" alt="Quick look" width="80%"/>
## Run
There are two pieces - the blockchain program (the meat of the project) and the frontend, which connects to the blockchain and can surface data about past and ongoing hunts. The frontend also surfaces information about how the project works.

All pieces are currently unfinished. It is possible to run a simulation against a local validator by deploying the contract and running `anchor test`. There are rough notes within `local/readme.txt` detailing how to set up to deploy the anchor contract, but this would first require properly setting up a local cluster to develop against.

### Frontend
to build the front end:
```
cd app/ && npm install && npm start
```

### Program
Deploying the backend locally requires an understanding of how to set up a solana test validator as well as how to test and deploy anchor programs. For more information, see the Anchor framework link above as well as the [Solana developer docs](https://docs.solana.com/developing/test-validator).

### Screenshots
---

<img src="local/homepage.png" alt="Homepage" width="80%"/>

---

<img src="local/quick-look.png" alt="Quick look" width="80%"/>
