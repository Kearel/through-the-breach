import {aspects} from "../../config.mjs"
import SheetWithRowsMixin from "../mixins/sheet-with-rows.mjs";

export class SkillSheet extends ItemSheet
{
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 600,
            height: 500,
            resizable: true
        });
    }

    get template() {
        return 'systems/through-the-breach/templates/items/skill-sheet.hbs';
    }

    async getData(options={}) {
        const context = super.getData(options);
        context.name = this.item.name;
        context.description = this.item.system.description;
        context.blurb = this.item.system.blurb;
        context.category = this.item.system.category;
        context.aspect = this.item.system.aspect;
        context.alternative_aspect = this.item.system.alternate_aspect;
        context.aspects = foundry.utils.duplicate(aspects);
        return context;
    }
}