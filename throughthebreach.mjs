import { FatedActorData } from "./module/models/actors/fated-model.mjs";
import {FatedSheet} from "./module/sheets/actors/fated-sheet.mjs";
import {TalentSheet} from "./module/sheets/items/talent-sheet.mjs";
import { TalentData} from "./module/models/items/talent-model.mjs";
import { TriggerData } from "./module/models/items/trigger-model.mjs";
import { TriggerSheet } from "./module/sheets/items/trigger-sheet.mjs";
import { SkillData } from "./module/models/items/skill-model.mjs";
import { SkillSheet } from "./module/sheets/items/skill-sheet.mjs";
import { PursuitData } from "./module/models/items/pursuit-model.mjs";
import { PursuitSheet } from "./module/sheets/items/pursuit-sheet.mjs";
import { EquipmentData } from "./module/models/items/equipment/equipment-model.mjs";
import { EquipmentSheet } from "./module/sheets/items/equipment/equipment-sheet.mjs";
import { MagiaData } from "./module/models/items/magic/magia-model.mjs";
import { MagiaSheet } from "./module/sheets/items/magic/magia-sheet.mjs";
import { ImmutoSheet } from "./module/sheets/items/magic/immuto-sheet.mjs";
import { ImmutoData } from "./module/models/items/magic/immuto-model.mjs";
import { FatemasterCharacterData } from "./module/models/actors/fatemaster-character-model.mjs";
import { FatemasterCharacterSheet } from "./module/sheets/actors/fatemaster-character-sheet.mjs";
import { SessionHandler } from "./module/models/apps/session-handler.mjs";
import { suit_to_font_awesome } from "./module/config.mjs";

/*
Portions of the materials used are copyrighted works of Wyrd Miniatures, LLC, in the United States of America and elsewhere.
All rights reserved, Wyrd Miniatures, LLC.
This material is not official and is not endorsed by Wyrd Miniatures, LLC
*/

globalThis.TTB = {
    actor_hand_preset: "fate",
    session_stage_prologue: "Prologue",
    session_stage_adventure: "Adventure",
    session_stage_epilogue: "Epilogue",
    general_talent_id: "GENERAL"
}


Hooks.once("init", () => {

    CONFIG.Actor.dataModels = {
        fated: FatedActorData,
        fatemaster: FatemasterCharacterData
    }

    CONFIG.Item.dataModels = {
        talent: TalentData,
        trigger: TriggerData,
        skill: SkillData,
        pursuit: PursuitData,
        equipment: EquipmentData,
        magia: MagiaData,
        immuto: ImmutoData
    }

    CONFIG.Cards.presets = {
        fate: {
            label: "TTB.FateDeckPreset",
            src: "systems/through-the-breach/packs/cards/fate-deck.json",
            type: "deck"
        }
    }

    CONFIG.Actor.trackableAttributes = {
        fated: ["wounds"],
        value: []
    }
    DocumentSheetConfig.registerSheet(Actor, "TTB", FatedSheet, 
        {
            types: ["fated"],
            makeDefault: true,
            label: "TTB.Fated"
        }
    );

    DocumentSheetConfig.registerSheet(Actor, "TTB", FatemasterCharacterSheet, 
        {
            types: ["fatemaster"],
            makeDefault: true,
            label: "TTB.Fatemaster"
        }
    );
    DocumentSheetConfig.registerSheet(Item, "TTB", TalentSheet,
        {
            types: ["talent"],
            makeDefault: true,
            label: "TTB.Talent"
        }
    );
    DocumentSheetConfig.registerSheet(Item, "TTB", TriggerSheet,
        {
            types: ["trigger"],
            makeDefault: true,
            label: "TTB.Trigger"
        }
    );
    DocumentSheetConfig.registerSheet(Item, "TTB", SkillSheet,
        {
            types: ["skill"],
            makeDefault: true,
            label: "TTB.Skill"
        }
    );
    DocumentSheetConfig.registerSheet(Item, "TTB", PursuitSheet,
        {
            types: ["pursuit"],
            makeDefault: true,
            label: "TTB.Pursuit"
        }
    );
    DocumentSheetConfig.registerSheet(Item, "TTB", EquipmentSheet,
        {
            types: ["equipment"],
            makeDefault: true,
            label: "TTB.Equipment"
        }
    );
    DocumentSheetConfig.registerSheet(Item, "TTB", MagiaSheet,
        {
            types: ["magia"],
            makeDefault: true,
            label: "TTB.Magia"
        }
    );
    DocumentSheetConfig.registerSheet(Item, "TTB", ImmutoSheet,
        {
            types: ["immuto"],
            makeDefault: true,
            label: "TTB.Immuto"
        }
    );
    Handlebars.registerHelper('capitalize', function(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    });
    Handlebars.registerHelper('isuit', function(str) {
        if(str in suit_to_font_awesome)
        {
            return "fa " + suit_to_font_awesome[str];
        }
        return "";
    });
    Handlebars.registerHelper('select', function(value, options) {
    // Create a select element 
    var select = document.createElement('select');
    
    
    // Populate it with the option HTML
    $(select).html(options.fn(this));
    
    //below statement doesn't work in IE9 so used the above one
    //select.innerHTML = options.fn(this); 
    
        // Set the value
        select.value = value;
    
        // Find the selected node, if it exists, add the selected attribute to it
        if (select.children[select.selectedIndex]) {
            select.children[select.selectedIndex].setAttribute('selected', 'selected');
        } else { //select first option if that exists
            if (select.children[0]) {
                select.children[0].setAttribute('selected', 'selected');
            }
        }
        return select.innerHTML;
    });
});

Hooks.once("setup", () => {
    const all_cards = {};
    game.cards.forEach((c) => (all_cards[c.id] = c.name));
    game.settings.register("through-the-breach", "fateDeck", {
        name: "Fate Deck",
        scope: "world",
        config: true,
        default: "",
        type: String,
        choices: all_cards
    });
    game.settings.register("through-the-breach", "fateDiscard", {
        name: "Fate Discard",
        scope: "world",
        config: true,
        default: "",
        type: String,
        choices: all_cards
    });
    game.settings.register("through-the-breach", "sessionStage", {
        name: "Session Started",
        scope: "world",
        config: false, 
        default: TTB.session_stage_epilogue,
        type: String
    });
    TTB.session_handler = new SessionHandler();
    TTB.session_handler.render(true);
});