import SheetWithItemsMixin from "../mixins/sheet-with-items.mjs";
import FateDuel from "../../cards/fate-duel.mjs";
import { CharacterCreator } from "../../character-creator/character-creator.mjs";
import { PursuitSelector } from "../../models/apps/select-pursuit.mjs";
import { aspects, equipment_types, suits } from "../../config.mjs";

export class FatedSheet extends SheetWithItemsMixin(ActorSheet) {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 800,
            height: 1000,
            resizable: true,
            tabs: [{ navSelector: ".tabs", contentSelector: ".content", intital: "stat"}]
        });
    }

    get template() {
        return 'systems/through-the-breach/templates/fated-sheet.hbs';
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".rankmod").on("click", this._modify_rank.bind(this));
        html.find(".rankmod").on("contextmenu", this._modify_rank.bind(this));
        html.find(".createduel").on("click", this._create_duel_skilled.bind(this));
        html.find(".setting_up").on("click", this._start_character_creator.bind(this));
        html.find(".addtrigger").on("click", this._add_trigger.bind(this));
        html.find(".addpursuittalent").on("click", this._add_pursuit_talent.bind(this));
        html.find(".generate_decks").on("click", this._generate_decks.bind(this));
    }

    _generate_decks(_event)
    {
        this.actor.system.generate_decks();
    }

    _start_character_creator(_event)
    {
        CharacterCreator.startCreatorDialog(this.actor);

    }

    _modify_rank(event)
    {
        var element = event.currentTarget.closest(".item");
        var skill = this.actor.getEmbeddedDocument("Item", element.dataset.itemid);
        if(event.handleObj.type == "click")
        {
            if(skill.system.rank < 5)
            {
                skill.update({system: {rank: skill.system.rank + 1}})
            }
        } else {

            if(skill.system.rank > 0)
            {
                skill.update({system: {rank: skill.system.rank - 1}})
            }
        }
    }

    async additemreal(type)
    {
        switch(type)
        {
            case "skill":
                await this.actor.createEmbeddedDocuments("Item", [{name: "Skill", type:"skill"}]);
                break;
            case "pursuit":
                await this.actor.createEmbeddedDocuments("Item", [{name: "Pursuit", type:"pursuit"}]);
                break;
            case "talent":
                await this.actor.createEmbeddedDocuments("Item", [{name: "Talent", type:"talent", system:{origin: "General"}}]);
                break;
            case "equipment":
                await this.actor.createEmbeddedDocuments("Item", [{name: "Equipment", type:"equipment"}]);
                break;
            case "immuto":
                await this.actor.createEmbeddedDocuments("Item", [{name: "Immuto", type:"immuto"}]);
                break;
            case "magia":
                await this.actor.createEmbeddedDocuments("Item", [{name: "Magia", type:"magia"}]);
                break;

        }
    }

    async _add_trigger(event)
    {
        const a = event.currentTarget;
        let el = a.closest(".item");
        await this.actor.createEmbeddedDocuments("Item", [{name: "Trigger", type:"trigger", system:{ skill: el.dataset.itemid}}]);
    }

    async _add_pursuit_talent(event)
    {
        const a = event.currentTarget;
        let el = a.closest(".item");
        var o = fromUuidSync(el.dataset.itemid);
        await this.actor.createEmbeddedDocuments("Item", [{name: "Talent", type:"talent", system:{ origin: el.dataset.itemid }}]);
    }

    _create_duel_skilled(event)
    {
        var element = event.currentTarget.closest(".item");
        var skill = fromUuidSync(element.dataset.itemid);
        FateDuel.createDuel(this.actor, skill.name);
    }

    async _generate_decks()
    {
        await this.actor.system.generate_decks();
        ChatMessage.create({
            content: "Generated Fate Deck/Hand/Discard",
            user: game.userId
        })
    }

    async _onDropItem(_event, data)
    {
        const iData = await Item.implementation.fromDropData(data);
        console.log(iData);
        return Item.create(iData, { parent: this.actor});
    }

    async getData(options={}) {
        const context = super.getData(options);
        context.actor = this.actor;
        context.level_up = this.actor.system.level_up;
        context.aspects = foundry.utils.deepClone(this.actor.system.aspects);
        context.derived = foundry.utils.deepClone(this.actor.system.derived);
        context.skills = foundry.utils.deepClone(this.actor.system.skills);
        context.general_talents = foundry.utils.deepClone(this.actor.system.general_talents);
        context.equipment = foundry.utils.deepClone(this.actor.system.equipment);
        context.magia = foundry.utils.deepClone(this.actor.system.magia);
        context.immuto = foundry.utils.deepClone(this.actor.system.immuto);
        context.triggers = foundry.utils.deepClone(this.actor.system.triggers);
        context.pursuits = foundry.utils.deepClone(this.actor.system.pursuits);
        context.active_player = this.actor.system.active_player;
        context.has_been_setup = this.actor.system.skills.length > 0;
        context.has_chosen_first_pursuit = this.actor.system.pursuits.length > 0;
        context.has_created_twist_deck = this.actor.system.twist_deck.length > 0;
        context.aspects_list = foundry.utils.deepClone(aspects);
        context.suits_list = foundry.utils.deepClone(suits);
        context.item_types = foundry.utils.deepClone(equipment_types);
        context.twist_deck = foundry.utils.deepClone(this.actor.system.twist_deck);
        context.fate_cards = foundry.utils.deepClone(this.actor.system.fate_cards);
        if(this.actor.system.cheat_deck != "None")
        {
            var deck = fromUuidSync(this.actor.system.cheat_deck);
            context.has_decks = deck != null;
        } else {
            context.has_decks = false;
        }
        //context.setting_up = !context.has_been_setup || !context.has_chosen_first_pursuit || !context.has_created_twist_deck || !context.has_created_twist_deck || !context.has_decks;
        return context;
    }
}