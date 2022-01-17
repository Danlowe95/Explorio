import { Connection, PublicKey, Commitment } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Program, Provider, web3 } from "@project-serum/anchor";
import * as spl from "@solana/spl-token";
import idl from "./idl.json";
import { AnchorTest } from "./anchor_test";

const programData = {
  stateAccount: "291iCq6ujVYxLsuJQuhejWn5vzWhXYWiyU1LaK3zvhvv",
  vrfAccount: "Ht1SaU7oBcunP1caqaAxJ185dojGgLJ5s3KP1TTWQZeH",
  historyAccount: "638yTfoLudbW5nKWQUdyUouENjWsw1kaWHDzTq98Yurp",
  explorerMint: "4c81Zvg5XpvguFd2WNAjDuyxyQBkUFadiZ8gzyjVTUh3",
  ustMint: "6W6JKZwM4f2uijaBvFNBYmt9JZmKHqY5Y1BU6hwEez2z",
};

const { SystemProgram, Keypair, SYSVAR_RENT_PUBKEY } = web3;

const opts: { [key: string]: Commitment } = {
  preflightCommitment: "processed",
};
const programID = new PublicKey("3cdx2BHuSCyyvLJt2ZhdcoPpSrMqzZHb2UPQD6f8tTUK");

// Define all static Pubkeys/Mints

export async function getProvider(wallet: WalletContextState) {
  /* create the provider and return it to the caller */
  /* network set to local network for now */
  const network = "http://127.0.0.1:8899";
  const connection = new Connection(network, opts.preflightCommitment);
  /* @ts-ignore */
  const provider = new Provider(connection, wallet, opts);
  return provider;
}

export const fetchHistoryState = async (wallet: WalletContextState) => {
  const provider = await getProvider(wallet);
  /* @ts-ignore */
  const program: Program<AnchorTest> = new Program(
    /* @ts-ignore */
    idl,
    programID,
    provider
  );
  let historyAccount: PublicKey = new PublicKey(programData.historyAccount);

  let historyState = await program.account.historyState.fetch(historyAccount);
  return historyState;
};

// export async function initializeHuntProgram(wallet: WalletContextState) {
//   const provider = await getProvider(wallet);
//   /* @ts-ignore */
//   const program = new Program(idl, programID, provider);
//   // const state_account = Keypair.generate();
//   const [stateAccount, stateAccountBump] = await PublicKey.findProgramAddress(
//     [Buffer.from("state", "utf-8")],
//     program.programId
//   );
//   const [programUstAccount, programUstAccountBump] =
//     await PublicKey.findProgramAddress(
//       [Buffer.from("fund", "utf-8")],
//       program.programId
//     );

//   // Example of associated token
//   // let associatedAccount = await spl.Token.getAssociatedTokenAddress(
//   //     spl.ASSOCIATED_TOKEN_PROGRAM_ID,
//   //     spl.TOKEN_PROGRAM_ID,
//   //     mintPda,
//   //     program.provider.wallet.publicKey,
//   // );

//   try {
//     await program.rpc.initializeProgram({
//       stateAccountBump,
//       programUstAccountBump,
//       accounts: {
//         authority: provider.wallet.publicKey,
//         stateAccount: stateAccount,
//         tokenProgram: spl.TOKEN_PROGRAM_ID,
//         associatedTokenProgram: spl.ASSOCIATED_TOKEN_PROGRAM_ID,
//         systemProgram: SystemProgram.programId,
//         rent: SYSVAR_RENT_PUBKEY,
//       },
//       signers: [],
//     });
//   } catch (err) {
//     console.log("Transaction error: ", err);
//   }
// }
// export async function createCounter(wallet: WalletContextState) {
//   const provider = await getProvider(wallet);
//   /* create the program interface combining the idl, program ID, and provider */
//   /* @ts-ignore */
//   const program = new Program(idl, programID, provider);
//   try {
//     /* interact with the program via rpc */
//     await program.rpc.create({
//       accounts: {
//         baseAccount: baseAccount.publicKey,
//         user: provider.wallet.publicKey,
//         systemProgram: SystemProgram.programId,
//       },
//       signers: [baseAccount],
//     });

//     const account = await program.account.baseAccount.fetch(
//       baseAccount.publicKey
//     );
//     console.log("account: ", account);
//     return account.count.toString();
//   } catch (err) {
//     console.log("Transaction error: ", err);
//   }
//   return null;
// }

// export async function increment(wallet: WalletContextState) {
//   const provider = await getProvider(wallet);
//   /* @ts-ignore */
//   const program = new Program(idl, programID, provider);

//   await program.rpc.increment({
//     accounts: {
//       baseAccount: baseAccount.publicKey,
//     },
//   });

//   const account = await program.account.baseAccount.fetch(
//     baseAccount.publicKey
//   );
//   console.log("account: ", account);
//   return account.count.toString();
// }

// export async function getCounter(wallet: WalletContextState) {
//   const provider = await getProvider(wallet);
//   /* @ts-ignore */
//   const program = new Program(idl, programID, provider);

//   const account = await program.account.baseAccount.fetch(
//     baseAccount.publicKey
//   );
//   return account.count.toString();
// }
