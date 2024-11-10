import {suits} from "../../config.mjs"

export class TriggerSheet extends ItemSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 500,
            height: 300,
            resizable: true
        });
    }

    get template() {
        return 'systems/through-the-breach/templates/items/trigger-sheet.hbs';
    }

    async getData(options={}){
        const context = super.getData(options);
        context.item = this.item;
        context.name = this.item.name;
        context.description = this.item.system.description;
        context.skill = this.item.system.skill;
        context.suits = foundry.utils.duplicate(suits);
        context.suit = this.item.system.suit;
        return context;
    }
}