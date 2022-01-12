var fs = require("fs");
const fileData = fs.readFileSync("./local/env.json");
const { mints } = JSON.parse(fileData);

const output = `const MINTS: [MintInfo; 17] = [
    MintInfo{ id: 0, mint_type: "NONE", ep: 0, mint: "NONE"}, // none
    MintInfo{ id: SHORTSWORD_ID, mint_type: "GEAR", ep: 1, mint: "${
      mints.find((x) => x.id == 1).address
    }"}, // gear_1: shortsword
    MintInfo{ id: LEATHER_ARMOR_ID, mint_type: "GEAR", ep: 1, mint: "${
      mints.find((x) => x.id == 2).address
    }"}, // gear_2: leather_armor
    MintInfo{ id: DAGGER_ID, mint_type: "GEAR", ep: 2, mint: "${
      mints.find((x) => x.id == 3).address
    }"}, // gear_3: Dagger
    MintInfo{ id: SHORTBOW_ID, mint_type: "GEAR", ep: 2, mint: "${
      mints.find((x) => x.id == 4).address
    }"}, // gear_4: Shortbow
    MintInfo{ id: LONGSWORD_ID, mint_type: "GEAR", ep: 3, mint: "${
      mints.find((x) => x.id == 5).address
    }"}, // gear_5: Longsword
    MintInfo{ id: CHAINMAIL_ARMOR_ID, mint_type: "GEAR", ep: 3, mint: "${
      mints.find((x) => x.id == 6).address
    }"}, // gear_6: Chainmail_armor
    MintInfo{ id: CROSSBOW_ID, mint_type: "GEAR", ep: 4, mint: "${
      mints.find((x) => x.id == 7).address
    }"}, // gear_7: Crossbow
    MintInfo{ id: PLATE_ARMOR_ID, mint_type: "GEAR", ep: 5, mint: "${
      mints.find((x) => x.id == 8).address
    }"}, // gear_8: Plate_armor
    MintInfo{ id: CUTTHROATS_DAGGER_ID, mint_type: "GEAR", ep: 6, mint: "${
      mints.find((x) => x.id == 9).address
    }"}, // gear_9: Cutthroats_dagger
    MintInfo{ id: EXCALIBUR_ID, mint_type: "GEAR", ep: 6, mint: "${
      mints.find((x) => x.id == 10).address
    }"}, // gear_10: Excalibur
    MintInfo{ id: TREASURE_SCROLL_ID, mint_type: "GEAR", ep: 0, mint: "${
      mints.find((x) => x.id == 11).address
    }"}, // Gear_11: Treasure scroll
    MintInfo{ id: POT_OF_SWIFTNESS_ID, mint_type: "POTION", ep: 0, mint: "${
      mints.find((x) => x.id == 12).address
    }"}, // potion_1: swiftness
    MintInfo{ id: POT_OF_STRENGTH_ID, mint_type: "POTION", ep: 2, mint: "${
      mints.find((x) => x.id == 13).address
    }"}, // potion_2: strength
    MintInfo{ id: POT_OF_MENDING_ID, mint_type: "POTION", ep: 0, mint: "${
      mints.find((x) => x.id == 14).address
    }"}, // potion_3: mending
    MintInfo{ id: POT_OF_RESILIENCE_ID, mint_type: "POTION", ep: 0, mint: "${
      mints.find((x) => x.id == 15).address
    }"}, // potion_4: resilience
    MintInfo{ id: GRAIL_ID, mint_type: "GRAIL", ep: 0, mint: "${
      mints.find((x) => x.id == 16).address
    }"}, // grail    
];
`;

fs.writeFileSync("./local/rust_crate.txt", output);
