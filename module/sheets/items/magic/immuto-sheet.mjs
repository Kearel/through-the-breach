import { immuto_schools } from "../../../config.mjs";

export class ImmutoSheet extends ItemSheet
{
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 800,
            height: 1000,
            resizable: true
        });
    }

    get template() {
        return 'systems/through-the-breach/templates/items/magic/immuto-sheet.hbs';
    }

    getData(){
        const context = super.getData(); 
        context.name = this.item.name;
        context.school = this.item.system.school;
        context.schools = foundry.utils.duplicate(immuto_schools);
        context.description = this.item.system.description;
        context.target_number_modifier = this.item.system.target_number_modifier;
        return context;
    }
}