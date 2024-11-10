import { equipment_types } from "../../../config.mjs";
import SheetWithRowsMixin from "../../mixins/sheet-with-rows.mjs";

export class EquipmentSheet extends SheetWithRowsMixin(ItemSheet)
{
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 800,
            height: 1000,
            resizable: true,
            dragDrop: [{dropSelector: "form"}],
            tabs: [{ navSelector: ".tabs", contentSelector: ".content", intital: "basic"}]
        });
    }

    get template() {
        return 'systems/through-the-breach/templates/items/equipment/equipment-sheet.hbs';
    }

    async _onDropItem(event, data)
    {
        const item = await Item.implementation.fromDropData(data);
        console.log(item);
    }

    async _onDrop(event){
        const data = TextEditor.getDragEventData(event);
        if(data.type == "Item")
        {
            const item = await Item.implementation.fromDropData(data);
            if(item.type == "equipment" && item.system.type == "modification")
            {
                if(this.item.system.type == "modification")
                {
                    throw new Error("Modifications can't modify another modification");
                } else {
                    if(this.item.system.modifications.includes(data.uuid))
                    {
                        throw new Error("This item already contains that modification");
                    }
                    const updates = foundry.utils.deepClone(this.item.system.modifications);
                    updates.push(data.uuid);
                    return await this.item.update({system: {modifications: updates}});
                }

            }
        }
    }

    _canDragDrop(selector){
        return this.isEditable;
    }

    _canDragStart(selector) {
        return this.isEditable;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".addeffect").on("click", this._addeffect.bind(this));
        html.find(".editeffect").on("click", this._editeffect.bind(this));
        html.find(".removeeffect").on("click", this._removeeffect.bind(this));
    }

    async _editeffect(event)
    {
        const a = event.currentTarget;
        let el = a.closest(".effect");
        if(el)
        {
            const ef = this.item.effects.get(el.dataset.effect);
            ef.sheet.render(true);
        }
    }

    async _removeeffect(event)
    {
        const a = event.currentTarget;
        let el = a.closest(".effect");
        if(el)
        {
            this.item.deleteEmbeddedDocuments("ActiveEffect", [el.dataset.effect]);
        }

    }

    async _addeffect(_event)
    {
        const effect = await ActiveEffect.implementation.create({name: this.item.name, icon: this.item.img}, {parent: this.item});
        effect.sheet.render(true);
    }

    async addrowreal(type)
    {
        switch(type)
        {
            case "special":
                const specials = foundry.utils.duplicate(this.item.system.special);
                specials.push("Tag");
                return await this.item.update({system: {special: specials}});
            case "hidden":
                const hiddens = foundry.utils.duplicate(this.item.system.hidden_tags);
                hiddens.push("Tag");
                return await this.item.update({system: {hidden_tags: hiddens}});
            case "attack":
                const attacks = foundry.utils.deepClone(this.item.system.attacks);
                attacks.push({
                    melee: true,
                    range: 1,
                    weak_damage: 1,
                    moderate_damage: 1,
                    severe_damage: 1,
                    skill: "Skill"
                });
                return await this.item.update({system: {attacks: attacks}});
        }
    }

    async removerowreal(type, index)
    {
        switch(type)
        {
            case "special":
                const specials = foundry.utils.duplicate(this.item.system.special);
                specials.splice(index, 1);
                return await this.item.update({system: {special: specials}});
            case "hidden":
                const hidden = foundry.utils.duplicate(this.item.system.hidden_tags);
                hidden.splice(index, 1);
                return await this.item.update({system: {hidden_tags: hidden}});
            case "attack":
                const attacks = foundry.utils.deepClone(this.item.system.attacks);
                attacks.splice(index, 1);
                return await this.item.update({system: {attacks: attacks}});
        }
    }

    async getData()
    {
        const context = super.getData();
        context.name = this.item.name;
        context.cost = this.item.cost;
        context.type = this.item.system.type;
        context.special = foundry.utils.deepClone(this.item.system.derived_specials);
        context.hidden = foundry.utils.duplicate(this.item.system.hidden_tags);
        context.attacks = foundry.utils.deepClone(this.item.system.derived_attacks);
        context.effects = foundry.utils.deepClone(this.item.effects);
        context.types = foundry.utils.duplicate(equipment_types)
        return context;
    }

}