export type AnchorTest = {
  "version": "0.1.0",
  "name": "anchor_test",
  "instructions": [
    {
      "name": "airdropStarter",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userShortswordAssociatedAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "shortswordMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuth",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeProgram",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vrfAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "historyAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programUstAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ustMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "programUstAccountBump",
          "type": "u8"
        },
        {
          "name": "mintAuthAccountBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "fetchVrf",
      "accounts": [
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vrfAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimHunt",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAssociatedExplorerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAssociatedProvidedGearAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAssociatedCombatRewardAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAssociatedPotionAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAssociatedTreasureAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "explorerEscrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "explorerMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "providedGearMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "providedPotionMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "combatRewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasureMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "explorerEscrowBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "enterHunt",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userExplorerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProvidedGearAssociatedAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPotionAssociatedAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "explorerEscrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "providedGearMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "providedPotionMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "explorerMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuth",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "explorerTokenBump",
          "type": "u8"
        },
        {
          "name": "explorerId",
          "type": "u16"
        },
        {
          "name": "providedPotion",
          "type": "bool"
        },
        {
          "name": "providedGearId",
          "type": "u8"
        },
        {
          "name": "providedPotionId",
          "type": "u8"
        }
      ]
    },
    {
      "name": "processHunt",
      "accounts": [
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vrfAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "historyAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programUstAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "historyState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalHunts",
            "type": "u64"
          },
          {
            "name": "totalExplorers",
            "type": "u64"
          },
          {
            "name": "totalGearBurned",
            "type": "u64"
          },
          {
            "name": "totalPer",
            "type": {
              "array": [
                "u64",
                17
              ]
            }
          },
          {
            "name": "writeInd",
            "type": "u32"
          },
          {
            "name": "unusedVal",
            "type": "u32"
          },
          {
            "name": "historyArr",
            "type": {
              "array": [
                {
                  "defined": "HistoryRow"
                },
                20000
              ]
            }
          }
        ]
      }
    },
    {
      "name": "vrfState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vrfArr",
            "type": {
              "array": [
                {
                  "defined": "PerCombatRandomization"
                },
                2500
              ]
            }
          },
          {
            "name": "isInitialized",
            "type": "u8"
          },
          {
            "name": "isUsable",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "huntState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "huntStateArr",
            "type": {
              "array": [
                {
                  "defined": "EnteredExplorer"
                },
                5000
              ]
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "isInitialized",
            "type": "u8"
          },
          {
            "name": "programUstAccountBump",
            "type": "u8"
          },
          {
            "name": "mintAuthAccountBump",
            "type": "u8"
          },
          {
            "name": "uselessVal",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "HistoryRow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "winner",
            "type": "u16"
          },
          {
            "name": "loser",
            "type": "u16"
          },
          {
            "name": "winnerGear",
            "type": "u8"
          },
          {
            "name": "loserGear",
            "type": "u8"
          },
          {
            "name": "transfer",
            "type": "u8"
          },
          {
            "name": "treasureId",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "PerCombatRandomization",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "treasureFoundSeed",
            "type": "u32"
          },
          {
            "name": "winnerSeed",
            "type": "u8"
          },
          {
            "name": "winnerGetsCombatRewardSeed",
            "type": "u8"
          },
          {
            "name": "resilienceSeed",
            "type": "u8"
          },
          {
            "name": "swiftnessSeed",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "EnteredExplorer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "explorerId",
            "type": "u16"
          },
          {
            "name": "explorerEscrowAccount",
            "type": "publicKey"
          },
          {
            "name": "isEmpty",
            "type": "u8"
          },
          {
            "name": "providedGearMintId",
            "type": "u8"
          },
          {
            "name": "providedPotionMintId",
            "type": "u8"
          },
          {
            "name": "explorerEscrowBump",
            "type": "u8"
          },
          {
            "name": "providedPotion",
            "type": "u8"
          },
          {
            "name": "hasHunted",
            "type": "u8"
          },
          {
            "name": "providedGearKept",
            "type": "u8"
          },
          {
            "name": "wonCombat",
            "type": "u8"
          },
          {
            "name": "wonCombatGear",
            "type": "u8"
          },
          {
            "name": "foundTreasure",
            "type": "u8"
          },
          {
            "name": "usedPotion",
            "type": "u8"
          },
          {
            "name": "combatRewardMintId",
            "type": "u8"
          },
          {
            "name": "treasureMintId",
            "type": "u8"
          },
          {
            "name": "unusedValue",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "BadMintProvided",
      "msg": "Bad mint provided."
    },
    {
      "code": 6001,
      "name": "HasNotHunted",
      "msg": "Claim is not possible yet as the Explorer has not hunted."
    },
    {
      "code": 6002,
      "name": "AlreadyInitialized",
      "msg": "The program has already been initialized."
    },
    {
      "code": 6003,
      "name": "ProgramNotInitialized",
      "msg": "The program has not been initialized."
    },
    {
      "code": 6004,
      "name": "StateArrFull",
      "msg": "State array is too full to add."
    },
    {
      "code": 6005,
      "name": "BadBumpProvided",
      "msg": "Bad bump provided."
    },
    {
      "code": 6006,
      "name": "IncorrectIndexFed",
      "msg": "An incorrect array index was fed through processing."
    },
    {
      "code": 6007,
      "name": "ImpossibleTreasureValue",
      "msg": "An impossible value was fed through getTreasureType."
    },
    {
      "code": 6008,
      "name": "RandomnessNotGenerated",
      "msg": "Randomness has not been generated ahead of processing."
    },
    {
      "code": 6009,
      "name": "RandomnessAlreadyGenerated",
      "msg": "Randomness has already been generated."
    }
  ]
};

export const IDL: AnchorTest = {
  "version": "0.1.0",
  "name": "anchor_test",
  "instructions": [
    {
      "name": "airdropStarter",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userShortswordAssociatedAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "shortswordMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuth",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "initializeProgram",
      "accounts": [
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vrfAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "historyAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programUstAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "ustMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "programUstAccountBump",
          "type": "u8"
        },
        {
          "name": "mintAuthAccountBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "fetchVrf",
      "accounts": [
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vrfAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimHunt",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAssociatedExplorerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAssociatedProvidedGearAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAssociatedCombatRewardAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAssociatedPotionAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userAssociatedTreasureAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "explorerEscrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuthPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "explorerMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "providedGearMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "providedPotionMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "combatRewardMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasureMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "associatedTokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "explorerEscrowBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "enterHunt",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userExplorerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userProvidedGearAssociatedAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "userPotionAssociatedAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "explorerEscrowAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "providedGearMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "providedPotionMint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "explorerMint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mintAuth",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "explorerTokenBump",
          "type": "u8"
        },
        {
          "name": "explorerId",
          "type": "u16"
        },
        {
          "name": "providedPotion",
          "type": "bool"
        },
        {
          "name": "providedGearId",
          "type": "u8"
        },
        {
          "name": "providedPotionId",
          "type": "u8"
        }
      ]
    },
    {
      "name": "processHunt",
      "accounts": [
        {
          "name": "stateAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vrfAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "historyAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "programUstAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "historyState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "totalHunts",
            "type": "u64"
          },
          {
            "name": "totalExplorers",
            "type": "u64"
          },
          {
            "name": "totalGearBurned",
            "type": "u64"
          },
          {
            "name": "totalPer",
            "type": {
              "array": [
                "u64",
                17
              ]
            }
          },
          {
            "name": "writeInd",
            "type": "u32"
          },
          {
            "name": "unusedVal",
            "type": "u32"
          },
          {
            "name": "historyArr",
            "type": {
              "array": [
                {
                  "defined": "HistoryRow"
                },
                20000
              ]
            }
          }
        ]
      }
    },
    {
      "name": "vrfState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vrfArr",
            "type": {
              "array": [
                {
                  "defined": "PerCombatRandomization"
                },
                2500
              ]
            }
          },
          {
            "name": "isInitialized",
            "type": "u8"
          },
          {
            "name": "isUsable",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "huntState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "huntStateArr",
            "type": {
              "array": [
                {
                  "defined": "EnteredExplorer"
                },
                5000
              ]
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "isInitialized",
            "type": "u8"
          },
          {
            "name": "programUstAccountBump",
            "type": "u8"
          },
          {
            "name": "mintAuthAccountBump",
            "type": "u8"
          },
          {
            "name": "uselessVal",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "HistoryRow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "winner",
            "type": "u16"
          },
          {
            "name": "loser",
            "type": "u16"
          },
          {
            "name": "winnerGear",
            "type": "u8"
          },
          {
            "name": "loserGear",
            "type": "u8"
          },
          {
            "name": "transfer",
            "type": "u8"
          },
          {
            "name": "treasureId",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "PerCombatRandomization",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "treasureFoundSeed",
            "type": "u32"
          },
          {
            "name": "winnerSeed",
            "type": "u8"
          },
          {
            "name": "winnerGetsCombatRewardSeed",
            "type": "u8"
          },
          {
            "name": "resilienceSeed",
            "type": "u8"
          },
          {
            "name": "swiftnessSeed",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "EnteredExplorer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "explorerId",
            "type": "u16"
          },
          {
            "name": "explorerEscrowAccount",
            "type": "publicKey"
          },
          {
            "name": "isEmpty",
            "type": "u8"
          },
          {
            "name": "providedGearMintId",
            "type": "u8"
          },
          {
            "name": "providedPotionMintId",
            "type": "u8"
          },
          {
            "name": "explorerEscrowBump",
            "type": "u8"
          },
          {
            "name": "providedPotion",
            "type": "u8"
          },
          {
            "name": "hasHunted",
            "type": "u8"
          },
          {
            "name": "providedGearKept",
            "type": "u8"
          },
          {
            "name": "wonCombat",
            "type": "u8"
          },
          {
            "name": "wonCombatGear",
            "type": "u8"
          },
          {
            "name": "foundTreasure",
            "type": "u8"
          },
          {
            "name": "usedPotion",
            "type": "u8"
          },
          {
            "name": "combatRewardMintId",
            "type": "u8"
          },
          {
            "name": "treasureMintId",
            "type": "u8"
          },
          {
            "name": "unusedValue",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "BadMintProvided",
      "msg": "Bad mint provided."
    },
    {
      "code": 6001,
      "name": "HasNotHunted",
      "msg": "Claim is not possible yet as the Explorer has not hunted."
    },
    {
      "code": 6002,
      "name": "AlreadyInitialized",
      "msg": "The program has already been initialized."
    },
    {
      "code": 6003,
      "name": "ProgramNotInitialized",
      "msg": "The program has not been initialized."
    },
    {
      "code": 6004,
      "name": "StateArrFull",
      "msg": "State array is too full to add."
    },
    {
      "code": 6005,
      "name": "BadBumpProvided",
      "msg": "Bad bump provided."
    },
    {
      "code": 6006,
      "name": "IncorrectIndexFed",
      "msg": "An incorrect array index was fed through processing."
    },
    {
      "code": 6007,
      "name": "ImpossibleTreasureValue",
      "msg": "An impossible value was fed through getTreasureType."
    },
    {
      "code": 6008,
      "name": "RandomnessNotGenerated",
      "msg": "Randomness has not been generated ahead of processing."
    },
    {
      "code": 6009,
      "name": "RandomnessAlreadyGenerated",
      "msg": "Randomness has already been generated."
    }
  ]
};
