import SheetWithRowsMixin from "../mixins/sheet-with-rows.mjs";

export class PursuitSheet extends SheetWithRowsMixin(ItemSheet)
{
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 800,
            height: 1000,
            resizable: true,
            dragDrop: [
                {dropSelector: ".talent_drop"}
            ]
        });
    }

    get template() {
        return 'systems/through-the-breach/templates/items/pursuit-sheet.hbs';
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".remove_talent").on("click", this._remove_talent.bind(this));
        html.find(".addgeneral").on("click", this._add_general_talent.bind(this));
    }

    _add_general_talent(event)
    {
        var a = event.target;
        var p = a.closest(".talent");
        var index = parseInt(p.dataset.index);
        var talents = foundry.utils.duplicate(this.item.system.talents_by_rank);
        talents[index].push(TTB.general_talent_id);
        this.item.update({system: {talents_by_rank: talents}});
    }

    _remove_talent(event)
    {
        if(event.target.id.endsWith("on_pursuit"))
        {
            this.item.update({system: {on_pursuit_talent: ""}});
        } else {
            var a = event.target;
            var p = a.closest(".talent");
            var index = parseInt(p.dataset.index);
            var talents = foundry.utils.duplicate(this.item.system.talents_by_rank);
            talents[index].splice(talents[index].indexOf(a.dataset.uuid), 1);
            this.item.update({system: {talents_by_rank: talents}});
        }
    }

    async addrowreal(_type)
    {
        const updated_talents = foundry.utils.duplicate(this.item.system.talents_by_rank);
        updated_talents.push([]);
        return await this.item.update({system: {talents_by_rank: updated_talents}});
    }

    async removerowreal(_type, index)
    {
        const updated_talents = foundry.utils.duplicate(this.item.system.talents_by_rank);
        updated_talents.splice(index, 1);
        return await this.item.update({system: {talents_by_rank: updated_talents}});
    }

    async _onDrop(event) {
        var data = TextEditor.getDragEventData(event);
        //Check if it is a talent or not
        var talent = fromUuidSync(data.uuid);
        if(talent.type != "talent")
        {
            ui.notifications.error("You can only put talents in these fields");
            return;
        }
        var a = event.target;
        if(a.id.endsWith("on_pursuit"))
        {
            this.item.update({system: {on_pursuit_talent: data.uuid}});
        } else {
            var p = a.closest(".talent_drop");
            var index = parseInt(p.dataset.index);
            var talents = foundry.utils.duplicate(this.item.system.talents_by_rank);
            talents[index].push(data.uuid);
            this.item.update({system: {talents_by_rank : talents}});
        }
    }

    async getData(){
        const context = super.getData();
        context.item = this.item;
        context.on_pursuit = this.item.system.on_pursuit_talent != "";
        return context;
    }
}