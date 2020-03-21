/*
UTILIZAR COMO METODOLOGIA?
enum EnchantmentType {
    Protection,
    Attack,
    Utils,
}
*/

// https://www.digminecraft.com/lists/enchantment_list_pc.php
export default {
    0: {
        name: "Protection",
        description: "General protection against attacks, fire, lava, and falling",
        //effectType: EnchantmentType.Protection,
        //effect: () => {} UTILIZAR COMO METODOLOGIA?
    },
    1: {
        name: "Fire Protection",
        description: "Reduces damage caused by fire and lava",
    },
    2: {
        name: "Feather Falling",
        description: "Reduces fall and teleportation damage",
    },
    3: {
        name: "Blast Protection",
        description: "Reduces blast and explosion damage",
    },
    4: {
        name: "Projectile Protection",
        description: "Reduces projectile damage (arrows, fireballs, fire charges)",
    },
    5: {
        name: "Respiration",
        description: "Extends underwater breathing (see better underwater)",
    },
    6: {
        name: "Aqua Affinity",
        description: "Speeds up how fast you can mine blocks underwater",
    },
    7: {
        name: "Thorns",
        description: "Causes damage to attackers",
    },
    8: {
        name: "Depth Strider",
        description: "Speeds up how fast you can move underwater",
    },
    9: {
        name: "Frost Walker",
        description: "Freezes water into ice so that you can walk on it",
    },
    10: {
        name: "Curse of Binding",
        description: "Cursed item can not be removed from player",
    },
    16: {
        name: "Sharpness",
        description: "Increases attack damage dealt to mobs",
    },
    17: {
        name: "Smite",
        description: "Increases attack damage against undead mobs",
    },
    18: {
        name: "Bane of Arthropods",
        description: "Increases attack damage against arthropods",
    },
    19: {
        name: "Knockback",
        description: "Increases knockback dealt (enemies repel backwards)",
    },
    20: {
        name: "Fire Aspect",
        description: "Sets target on fire",
    },
    21: {
        name: "Looting",
        description: "Increases amount of loot dropped when mob is killed",
    },
    22: {
        name: "Sweeping Edge",
        description: "Increases damage of sweep attack",
    },
    32: {
        name: "Efficiency",
        description: "Increases how fast you can mine",
    },
    33: {
        name: "Silk Touch",
        description: "Mines blocks themselves (fragile items)",
    },
    34: {
        name: "Unbreaking",
        description: "Increases durability of item",
    },
    35: {
        name: "Fortune",
        description: "Increases block drops from mining",
    },
    48: {
        name: "Power",
        description: "Increases damage dealt by bow",
    },
    49: {
        name: "Punch",
        description: "Increases knockback dealt (enemies repel backwards)",
    },
    50: {
        name: "Flame",
        description: "Turns arrows into flaming arrows",
    },
    51: {
        name: "Infinity",
        description: "Shoots an infinite amount of arrows",
    },
    61: {
        name: "Luck of the Sea",
        description: "Increases chances of catching valuable items",
    },
    62: {
        name: "Lure",
        description: "Increases the rate of fish biting your hook",
    },
    65: {
        name: "Loyalty",
        description: "Returns your weapon when it is thrown like a spear",
    },
    66: {
        name: "Impaling",
        description: "Increases attack damage against sea creatures",
    },
    67: {
        name: "Riptide",
        description: "Propels the player forward when enchanted item is thrown while in water or rain",
    },
    68: {
        name: "Channeling",
        description: "Summons a lightning bolt at a targeted mob when enchanted item is thrown (targeted mob must be standing in raining)",
    },
    70: {
        name: "Mending",
        description: "Uses xp to mend your tools, weapons and armor",
    },
    71: {
        name: "Curse of Vanishing",
        description: "Cursed item will disappear after player dies",
    },
}
