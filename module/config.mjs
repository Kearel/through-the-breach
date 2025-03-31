export const derived_keys = [
    "defense",
    "willpower",
    "initiative",
    "wounds",
    "walk",
    "charge"
]

export const derived_initial_values = {
    defense: 2,
    willpower: 2,
    initiative: 0,
    wounds: 4,
    walk: 4,
    charge: 4
}

export const suits = [
    "rams",
    "crows",
    "tomes",
    "masks"
]

export const aspects = [
    "might",
    "grace",
    "speed",
    "resilience",
    "intellect",
    "charm",
    "cunning",
    "tenacity",
    "defense",
    "walk",
    "armor",
    "charge",
    "willpower",
    "initiative",
    "wounds",
    "height"
]

export const body_aspects = [
    "might",
    "grace",
    "speed",
    "resilience"
]

export const mind_aspects = [
    "intellect",
    "charm",
    "cunning",
    "tenacity"
]

export const derived_aspects = [
    "defense",
    "walk",
    "armor",
    "charge",
    "willpower",
    "initiative",
    "wounds",
    "height"
]

export const aspect_dictionary = {
    "might" : "Might",
    "grace" : "Grace",
    "speed" : "Speed",
    "resilience" : "Resilience",
    "intellect" : "Intellect",
    "charm" : "Charm",
    "cunning" : "Cunning",
    "tenacity" : "Tenacity",
    "defense" : "Defense",
    "walk" : "Walk",
    "armor" : "Armor",
    "charge" : "Charge",
    "willpower" : "Willpower",
    "initiative" : "Initiative",
    "wounds" : "Wounds",
    "height" : "Height"
}

export const equipment_types = [
    "gear",
    "weapon",
    "armor",
    "grimoire",
    "modification"
]

export const magic_schools = [
    "none",
    "enchanting",
    "necromancy",
    "prestidigitation",
    "sorcery"
]

export const immuto_schools = [
    "none",
    "alteration",
    "elemental"
]

export const suit_to_font_awesome = {
    "rams" : "fa-sheep",
    "crows" : "fa-crow",
    "tomes" : "fa-book-open",
    "masks" : "fa-masks-theater"
}

export function tn_to_difficulty(tn)
{
    if(tn <= 6)
    {
        return "Easy";
    } else if(tn <= 8)
    {
        return "Routine";
    } else if (tn <= 11)
    {
        return "Challenging";
    } else if (tn <= 14)
    {
        return "Difficult";
    } else if (tn <= 17)
    {
        return "Very Unlikely";
    } else if (tn <= 20)
    {
        return "Incredibly Difficult";
    }
    return "Highly Improbable";
}

export const twist_to_numbers = {
    "ascendant" : [4,8,12],
    "center" :  [3,7,11],
    "defining" :  [1,5,9,13],
    "descendant" : [2,6,10]
}