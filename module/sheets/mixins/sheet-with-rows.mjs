export default function SheetWithRowsMixin(Base) {
    return class SheetWithRows extends Base {

        activateListeners(html) {
            super.activateListeners(html);
            html.find(".addrow").on("click", this._addrow.bind(this));
            html.find(".removerow").on("click", this._removerow.bind(this));
        }

        async _addrow(event) {
            const a = event.currentTarget;
            let el = a.closest(".item-list");
            if(el)
            {
                return this.addrowreal(el.dataset.itemtype);
            }
        }

        async addrowreal(type) {
            return undefined;
        }
    
        async _removerow(event) {
            const a = event.currentTarget;
            let el = a.closest(".item");
            if(el)
            {
                let il = el.closest(".item-list");
                if(il)
                {
                    return this.removerowreal(il.dataset.itemtype, el.dataset.index)
                }
            }
        }

        async removerowreal(type, index)
        {
            return undefined;
        }
    }
}