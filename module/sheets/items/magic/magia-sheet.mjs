import { magic_schools, aspects, suits } from "../../../config.mjs";

export class MagiaSheet extends ItemSheet
{
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 800,
            height: 1000,
            resizable: true
        });
    }

    get template() {
        return 'systems/through-the-breach/templates/items/magic/magia-sheet.hbs';
    }

    getData(){
        const context = super.getData();
        context.name = this.item.name;
        context.school = this.item.system.school;
        context.schools = foundry.utils.duplicate(magic_schools);
        context.aspect = this.item.system.aspect;
        context.aspects = foundry.utils.duplicate(aspects);
        context.ap_cost = this.item.system.ap_cost;
        context.target_number = foundry.utils.deepClone(this.item.system.target_number);
        context.suits = foundry.utils.duplicate(suits);
        context.resist_aspect = this.item.system.resist_aspect;
        context.range = this.item.system.range;
        context.melee = this.item.system.melee;
        context.blurb = this.item.system.blurb;
        context.description = this.item.system.description;
        return context;
    }

}