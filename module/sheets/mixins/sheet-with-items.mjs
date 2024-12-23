export default function SheetWithItemsMixin(Base) {
    return class SheetWithItems extends Base {

        activateListeners(html) {
            super.activateListeners(html);
            html.find(".additem").on("click", this._additem.bind(this));
            html.find(".removeitem").on("click", this._removeitem.bind(this));
            html.find(".item_data").on("change", this._item_value_changed.bind(this));
            html.find(".examineitem").on("click", this._examine_item.bind(this));
        }

        async _examine_item(event)
        {
            const a = event.currentTarget;
            let el = a.closest(".item");
            if(el)
            {
                var o = fromUuidSync(el.dataset.itemid);
                o.sheet.render(true);   
            }
        }

        async _additem(event) {
            const a = event.currentTarget;
            let el = a.closest(".item-list");
            if(el)
            {
                return this.additemreal(el.dataset.itemtype);
            }
        }

        async additemreal(type) {
            return undefined;
        }
    
        async _removeitem(event) {
            const a = event.currentTarget;
            let el = a.closest(".item");
            let il = a.closest(".item-list");
            if(el && il)
            {
                var s = el.dataset.itemid.split(".");
                await this.object.deleteEmbeddedDocuments("Item",[s[s.length - 1]]);
            }
        }

        async _item_value_changed(event)
        {
            const a = event.currentTarget;
            let el = a.closest(".item");
            if(el)
            {
                var o = fromUuidSync(el.dataset.itemid);
                var data = {};
                if(a.type == "checkbox")
                {
                    data[a.dataset.var] = a.checked;
                } else {
                    data[a.dataset.var] = a.value;
                }
                await o.update(data);
            }
        }
    }
}