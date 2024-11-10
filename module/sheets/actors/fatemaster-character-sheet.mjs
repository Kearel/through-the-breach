import SheetWithItemsMixin from "../mixins/sheet-with-items.mjs";


export class FatemasterCharacterSheet extends SheetWithItemsMixin(ActorSheet) {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 800,
            height: 1000,
            resizable: true,
        });
    }

    get template() {
        return 'systems/through-the-breach/templates/fatemaster-character-sheet.hbs';
    }

    async getData(options={}) {
        const context = super.getData(options);
        context.actor = this.actor;
        context.aspects = foundry.utils.deepClone(this.actor.system.aspects);
        context.derived = foundry.utils.deepClone(this.actor.system.derived);
        return context;
    }

    async _onDropItem(_event, data)
    {
        const iData = await Item.implementation.fromDropData(data);
        console.log(iData);
        return Item.create(iData, { parent: this.actor});
    }
}