export default function SheetWithItemsMixin(Base) {
    return class SheetWithItems extends Base {

        activateListeners(html) {
            super.activateListeners(html);
            html.find(".additem").on("click", this._additem.bind(this));
            html.find(".removeitem").on("click", this._removeitem.bind(this));
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
            if(el)
            {
                this.object.deleteEmbeddedDocuments(el.dataset.doctype,[el.dataset.itemid])
            }
        }
    }
}