import SheetWithItemsMixin from "../mixins/sheet-with-items.mjs";
import FateDuel from "../../cards/fate-duel.mjs";
import { CharacterCreator } from "../../character-creator/character-creator.mjs";
import { PursuitSelector } from "../../models/apps/select-pursuit.mjs";

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

    async getData(options={}) {
        const context = super.getData(options);
        context.actor = this.actor;
        context.level_up = this.actor.system.level_up;
        context.aspects = foundry.utils.deepClone(this.actor.system.aspects);
        context.derived = foundry.utils.deepClone(this.actor.system.derived);
        context.skills = foundry.utils.deepClone(this.actor.system.skills);
        context.talents = foundry.utils.deepClone(this.actor.system.talents);
        context.triggers = foundry.utils.deepClone(this.actor.system.triggers);
        context.pursuits = foundry.utils.deepClone(this.actor.system.pursuits);
        context.active_player = this.actor.system.active_player;
        context.has_been_setup = this.actor.system.skills.length > 0;
        context.has_chosen_first_pursuit = this.actor.system.pursuits.length > 0;
        context.has_created_twist_deck = this.actor.system.twist_deck.length > 0;
        if(this.actor.system.cheat_deck != "None")
        {
            var deck = fromUuidSync(this.actor.system.cheat_deck);
            context.has_decks = deck != null;
        } else {
            context.has_decks = false;
        }
        context.setting_up = !context.has_been_setup || !context.has_chosen_first_pursuit || !context.has_created_twist_deck || !context.has_created_twist_deck || !context.has_decks;
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".rankmod").on("click", this._modify_rank.bind(this));
        html.find(".rankmod").on("contextmenu", this._modify_rank.bind(this));
        html.find(".createduel").on("click", this._create_duel_skilled.bind(this));
        html.find(".setting_up").on("click", this._start_character_creator.bind(this));
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

    _create_duel_skilled(event)
    {
        var element = event.currentTarget.closest(".item");
        var skill = this.actor.getEmbeddedDocument("Item", element.dataset.itemid);
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
}