import { draw_card } from "../../cards/draw-card.mjs";
import { body_aspects, mind_aspects } from "../../config.mjs";

export class TarotReader extends Application {
    constructor(fated, tarot) {
        super();
        this.current_step = -1;
        this.all_skills = game.items.filter((item) => item.type == "skill");
        this.context = {
            fated: fated,
            skills: [],
            body_aspects: {},
            mind_aspects: {},
            fate: [],
            tarot: tarot
        };
        body_aspects.forEach((value) => {
            this.context.body_aspects[value] = null;
        });
        mind_aspects.forEach((value) => {
            this.context.mind_aspects[value] = null;
        });
    }

    static get defaultOptions(){
        return foundry.utils.mergeObject(super.defaultOptions, {
            title: 'Tarot Reader',
            classes: ['form'],
            template: "systems/through-the-breach/templates/apps/tarot-reader.hbs",
            closeOnSubmit: false,
            width:800,
            height:800,
            dragDrop: [{
                dragSelector: ".draggable",
                dropSelector: ".dropAspect"
            }]

        });
    }

    start() {
        return new Promise(async (resolve, reject) => {
            document.addEventListener("tarot_done", resolve, {once: true});
            this.set_step(0).then( ()=> {
                this.render(true);
            });

        });
    }

    activateListeners(html){
        html.find(".continue_step").on()
        html.find(".continue_step").on("click", this._continue.bind(this));
        html.find(".back_step").on("click", this._back.bind(this));
        html.find("#select_skill").on("change", this._setupDescription.bind(this));
        html.find(".skill_value").on("click", this._add_skill.bind(this));
        super.activateListeners(html);
    }

    _add_skill(event)
    {
        var skill = document.getElementById("select_skill").value;
        if(skill != "")
        {
            var index = event.currentTarget.dataset.index;
            var value = this.step.chosen_values[event.currentTarget.dataset.index];
            this._remove_chosen_value(index);
            var actual = this.all_skills.find((a) => a.uuid == skill);
            this.context.skills.push({uuid: skill, name: actual.name, value: value});
            this.render();
        }
    }

    _setupDescription(_event)
    {
        var val = document.getElementById("select_skill").value;
        var result = "";
        if(val != "")
        {
            var s = this.all_skills.find((skill) => skill.uuid == val);
            result = "<b>" + s.system.aspect.capitalize() + (s.system.alternate_aspect != "Aspect" ? " or " + s.system.alternate_aspect.capitalize() : "") + "</b> " + s.system.blurb;
        }
        document.getElementById("desc_skill").innerHTML = result;
    }

    _onDragStart(event)
    {
        var index = event.currentTarget.dataset.index;
        event.dataTransfer.setData("text/plain", index);
    }

    _onDrop(event)
    {
        var aspects;
        if(event.currentTarget.dataset.type == "BODY")
        {
            aspects = this.context.body_aspects;
        } else if(event.currentTarget.dataset.type == "MIND")
        {
            aspects = this.context.mind_aspects;
        }
        var index = TextEditor.getDragEventData(event);
        if(this.step?.options?.aspect_value_add ?? false)
        {
            if(aspects[event.currentTarget.dataset.index] == null)
            {
                aspects[event.currentTarget.dataset.index] == 0;
            }
            if(aspects[event.currentTarget.dataset.index] >= 3)
            {
                return;
            }
            aspects[event.currentTarget.dataset.index] += this.step.chosen_values[index];
        } else {
            if(aspects[event.currentTarget.dataset.index] != null)
            {
                this.step.chosen_values.push(aspects[event.currentTarget.dataset.index]);
            }
            
            aspects[event.currentTarget.dataset.index] = this.step.chosen_values[index];
        }
        this._remove_chosen_value(index);
        this.render();
    }

    _remove_chosen_value(index)
    {
        if(this.step.mode == "MODIFY")
        {
            this.step.chosen_values = [];
        } else {
            this.step.chosen_values.splice(index, 1);
        }
    }

    async _continue()
    {
        await this.set_step(this.current_step + 1);
        this.render();
    }

    async _back()
    {
        await this.set_step(this.current_step - 1);
        this.render();
    }

    get step()
    {
        return this.context.tarot.steps[this.current_step];
    }

    getDataFromStepCard(step_label, card)
    {
        return this.context.tarot.steps.find((step) => step.label == step_label).results[card.suit][card.value];
    }

    getSelectedCardDataForStep(step_label)
    {
        var step = this.context.tarot.steps.find((step) => step.label == step_label);
        return step.results[step.drawn[0].suit][step.drawn[0].value];
    }

    getCardsFromStepLabel(step_label)
    {
        return this.context.tarot.steps.find((step) => step.label == step_label)?.drawn ?? [];
    }

    get_page_data()
    {
        var data = {
            can_back: this.current_step > 0,
            can_continue: true
        };
        if(this.step.mode == "ASPECT_BODY" || this.step.mode == "ASPECT_MODE" || this.step.mode == "SKILL_ADD")
        {
            data.can_continue = this.step.chosen_values.length == 0;
        }
        if(this.step.mode == "SKILL_ADD" || this.step.mode == "MODIFY")
        {
            if(this.step.chosen_values.length > 0) //No need to filter if we aren't going to make another choice
            {
                var dic = {"" : ""};
                this.all_skills.filter((skill) => {
                    return this.context.skills.findIndex(value => value.uuid == skill.uuid) < 0;
                }).forEach((value) => dic[value.uuid] = value.name); //Put on a filter here.
                data.available_skills = dic;
            }
        }
        if(this.step.mode == "MODIFY")
        {
            if(this.step.chosen_values.length > 0)
            {
                data.SHOW_MODIFY = true;
            }
            data.ASPECT_BODY = true;
            data.ASPECT_MIND = true;
        }
        return data;
    }

    _setupChosenValues()
    {
        if(!("chosen_values" in this.step))
        {
            if("value" in this.step?.options ?? {})
            {
                this.step.chosen_values = this.step.options.value;
            } else {
                this.step.chosen_values = this.getDataFromStepCard(this.step.label, this.step.drawn[0]).values;
            }
                
            if("from" in this.step?.options ?? {}) //This is so weird. Definitely not robust.
            {
                var value = this.getDataFromStepCard(this.step.options.from.step, this.getCardsFromStepLabel(this.step.options.from.step)[0])[this.step.options.from.value];
                if(this.context.skills.findIndex(skill => skill.name == value) < 0) //We dont have the skill in question. Set it up.
                {
                    var rank = this.step.chosen_values.pop(); //Take a value from chosen
                    var uid = this.all_skills.find((skill) => skill.name == value).uuid;
                    this.context.skills.push({uuid: uid, name: value, value: rank});
                }
            }
        }
    }

    

    async set_step(new_val)
    {
        this.current_step = new_val;
        if(this.current_step >= this.context.tarot.steps.length)
        {
            const ev = new CustomEvent("tarot_done", { detail: this.context});
            document.dispatchEvent(ev);
            this.close();
            return;
        }
        this.step_data = {};
        this.step_data[this.step.mode] = true;
        this.step_data.title = this.step.label;
        this.step_data.subtitle = this.step.subtitle;
        if(!(this.step?.did_draw ?? false) && (this.step?.options?.draw ?? 1) > 0)
        {
             this.step.drawn = await draw_card(this.step?.options?.draw ?? 1);
             this.step.did_draw = true;
        }
        if(this.step.instructions)
        {
            var data = {};
            if(this.step.did_draw)
            {
                data = this.getDataFromStepCard(this.step.label, this.step.drawn[0]);
            }
            this.step_data.instructions = game.i18n.format(this.step.instructions, data);
        }
        switch(this.step.mode)
        {
            case "ASPECT_BODY":
            case "ASPECT_MIND":
                this._setupChosenValues();
                this.step_data.draggable_values = this.step.chosen_values;
                break;
            case "SKILL_ADD":
                this._setupChosenValues();
                this.step_data.clickable_values = this.step.chosen_values;
                break;
            case "MODIFY":
                this._setupChosenValues();
                break;
            case "FATE":
                if(this.context.fate.length == 0)
                {
                    this.step.options.order.forEach((value) => {
                        var specific = this.context.tarot.steps.find((s) => s.label == value);
                        this.context.fate.push(
                            {
                                card: {
                                    suit: specific.drawn[0].suit,
                                    value: specific.drawn[0].value
                                },
                                fate: specific.results[specific.drawn[0].suit][specific.drawn[0].value].fate,
                                label: value
                            }
                        );
                    });
                }
        }
    }

    getData()
    {
        return Object.assign({}, this.get_page_data(), this.step_data, this.context);
    }
}
