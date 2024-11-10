import SheetWithRowsMixin from "../mixins/sheet-with-rows.mjs";

export class TalentSheet extends SheetWithRowsMixin(ItemSheet)
{
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 800,
            height: 1000,
            resizable: true
        });
    }

    get template() {
        return 'systems/through-the-breach/templates/items/talent-sheet.hbs';
    }

    async addrowreal(type){
        switch(type)
        {
            case "modification":
                break;
            case "derived":
                var derived = {
                    for: "For",
                    skill: "Skill"
                }
                const updated_derived = foundry.utils.duplicate(this.item.system.new_possible_derived_modifiers);
                updated_derived.push(derived);
                return await this.item.update({system: {new_possible_derived_modifiers: updated_derived}});
        }
    }

    async removerowreal(type, index){
        switch(type)
        {
            case "modification":
                break;
            case "derived":
                const updated_derived = foundry.utils.duplicate(this.item.system.new_possible_derived_modifiers);
                updated_derived.splice(index, 1);
                return await this.item.update({system: {new_possible_derived_modifiers: updated_derived}});
        }
    }

    async getData(options={}) {
        const context = super.getData(options);
        context.name = this.item.name;
        context.description = this.item.system.description;
        context.origin = this.item.system.origin;
        context.modifications = foundry.utils.deepClone(this.item.system.modifications);
        context.derived_modifiers = foundry.utils.deepClone(this.item.system.new_possible_derived_modifiers);
        return context;
    }
}