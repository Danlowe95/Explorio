import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token";

export const DATA_FILE = "./local/initialized_data.json";
export const RESULTS_FILE = "./local/results.json";
export const USER_ACCOUNTS_FILE = `./local/initialized_accounts.json`;

export const HUNT_ACCOUNT_SIZE = 240046;
export const VRF_ACCOUNT_SIZE = 20012;
export const HISTORY_ACCOUNT_SIZE = 240176;
export const GEARDROP_ACCOUNT_SIZE = 20008;

export const USER_GROUP_SIZE = 50;

export const NONE_ID = 0;
export const SHORTSWORD_ID = 1;
export const LEATHER_ARMOR_ID = 2;
export const DAGGER_ID = 3;
export const SHORTBOW_ID = 4;
export const LONGSWORD_ID = 5;
export const CHAINMAIL_ARMOR_ID = 6;
export const CROSSBOW_ID = 7;
export const PLATE_ARMOR_ID = 8;
export const CUTTHROATS_DAGGER_ID = 9;
export const EXCALIBUR_ID = 10;
export const TREASURE_SCROLL_ID = 11;

export const POT_OF_SWIFTNESS_ID = 12;
export const POT_OF_STRENGTH_ID = 13;
export const POT_OF_MENDING_ID = 14;
export const POT_OF_RESILIENCE_ID = 15;

export const GRAIL_ID = 16;

// When no real potion is being provided/retrieved, a potion account/mint is still required by the protocol. Use this one.
export const NONE_POTION_ID = POT_OF_STRENGTH_ID;
// Same situation for gear
export const NONE_GEAR_ID = SHORTSWORD_ID;

export const TREASURE_NAMES: { [treasureId: number]: string } = {
  0: "None",
  [SHORTSWORD_ID]: "Shortsword",
  [LEATHER_ARMOR_ID]: "LeatherArmor",
  [DAGGER_ID]: "Dagger",
  [SHORTBOW_ID]: "Shortbow",
  [LONGSWORD_ID]: "Longsword",
  [CHAINMAIL_ARMOR_ID]: "ChainMailArmor",
  [CROSSBOW_ID]: "Crossbow",
  [PLATE_ARMOR_ID]: "PlateArmor",
  [CUTTHROATS_DAGGER_ID]: "CutthroatsDagger",
  [EXCALIBUR_ID]: "Excalibur",
  [TREASURE_SCROLL_ID]: "TreasureScroll",
  [POT_OF_SWIFTNESS_ID]: "PotionOfSwiftness",
  [POT_OF_STRENGTH_ID]: "PotionOfStrength",
  [POT_OF_MENDING_ID]: "PotionOfMending",
  [POT_OF_RESILIENCE_ID]: "PotionOfResilience",
  [GRAIL_ID]: "Grail",
};

export const TREASURE_DISPLAY_NAMES: { [treasureId: number]: string } = {
  0: "None",
  [SHORTSWORD_ID]: "Shortsword",
  [LEATHER_ARMOR_ID]: "Leather armor",
  [DAGGER_ID]: "Dagger",
  [SHORTBOW_ID]: "Shortbow",
  [LONGSWORD_ID]: "Longsword",
  [CHAINMAIL_ARMOR_ID]: "Chainmail armor",
  [CROSSBOW_ID]: "Crossbow",
  [PLATE_ARMOR_ID]: "Plate armor",
  [CUTTHROATS_DAGGER_ID]: "Cutthroat's dagger",
  [EXCALIBUR_ID]: "Excalibur",
  [TREASURE_SCROLL_ID]: "Treasure scroll",
  [POT_OF_SWIFTNESS_ID]: "Potion of swiftness",
  [POT_OF_STRENGTH_ID]: "Potion of strength",
  [POT_OF_MENDING_ID]: "Potion of mending",
  [POT_OF_RESILIENCE_ID]: "Potion of resilience",
  [GRAIL_ID]: "Grail",
};
export interface MintMap {
  [mintId: number]: spl.Token;
}
export interface AssociatedAccountMintMap {
  [mintId: number]: anchor.web3.PublicKey;
}
export interface MintMapValues {
  [mintId: number]: number;
}

export interface FakeUser {
  user: anchor.web3.Keypair;
  explorerId: number;
  explorerAccount: anchor.web3.PublicKey;
  explorerEscrowAccount: anchor.web3.PublicKey;
  explorerEscrowAccountBump: number;
  ustAccount: anchor.web3.PublicKey;
  userAssociatedAccountMintMap: AssociatedAccountMintMap;
  accountHoldings: MintMapValues;
}
export interface EnteredExplorer {
  isEmpty: boolean;
  explorerId: number;
  explorerEscrowAccount: anchor.web3.PublicKey;
  providedGearMintId: number;
  providedPotionMintId: number;
  explorerEscrowBump: number;
  providedPotion: boolean;
  hasHunted: boolean;
  providedGearKept: boolean;
  wonCombat: boolean;
  wonCombatGear: boolean;
  foundTreasure: boolean;
  usedPotion: boolean;
  combatRewardMintId: number;
  treasureMintId: number;
}

export interface HistoryRow {
  winner: number;
  loser: number;
  winnerGear: number;
  loserGear: number;
  transfer: number;
  treasureId: number;
}

export interface MintInfo {
  id: number;
  address: string;
}
