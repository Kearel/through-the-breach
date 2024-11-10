import { SelectFewChoiceDialog } from "../dialogs/select-few-choices.mjs";

export class PursuitSelector extends Application
{
    constructor(fated, gain_mode)
    {
        super();
        this.gain = gain_mode;
        this.fated = fated;
        this.is_first_pursuit = this.fated.system.pursuits.length == 0;
        this.pursuits = {};
        this.selected_pursuit = {};
        var active_pursuits = [];
        this.fated.system.pursuits.forEach(pursuit => {
            this.pursuits[pursuit.uuid] = pursuit.name;
            active_pursuits.push(pursuit.name);
        });
        game.items.forEach(element => {
            if(element.type == "pursuit")
            {
                if(!active_pursuits.some((value) => element.name == value))
                {
                    this.pursuits[element.uuid] = element.name;
                }
            }
        });
        this.select_pursuit(Object.keys(this.pursuits)[0]);

    }

    static createPursuitSelector(fated, gain)
    {
        var s = new this(fated, gain);
        s.render(true);
        return s;
    }

    static get defaultOptions()
    {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 800,
            height: 800,
            title: 'Tarot Reader',
            classes: ['form'],
            template: "systems/through-the-breach/templates/apps/pursuit-selector.hbs",
        });
    }

    getSelectedPursuit()
    {
        return new Promise(async (resolve, reject) => {
            document.addEventListener("pursuit_done", resolve, {once: true});
        });
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".addpursuit").on("click", this._add_pursuit.bind(this));
        html.find(".selectpursuit").on("click", this._select_pursuit.bind(this));
    }

    //Get a pursuit
    async _add_pursuit(_event)
    {
        if(this.gain) //Just purusing.
        {
            const ev = new CustomEvent("pursuit_done", {pursuit: this.selected_pursuit.uuid});
            document.dispatchEvent(ev);
            this.close();
        }
    }

    _select_pursuit(event)
    {
        var a = event.currentTarget;
        this.select_pursuit(a.dataset.index);
        this.render(true);
    }

    select_pursuit(uuid)
    {
        var p = fromUuidSync(uuid);
        this.selected_pursuit = p;
        if(this.selected_pursuit.system.on_pursuit_talent)
        {
            this.selected_pursuit.on_pursuit = fromUuidSync(p.system.on_pursuit_talent);
        }
    }

    getData()
    {
        return {
            gain_mode: this.gain,
            is_first: this.is_first_pursuit,
            pursuits: this.pursuits,
            selected_pursuit: this.selected_pursuit,
        };
    }
}