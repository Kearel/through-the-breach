import { derived_initial_values, derived_keys, equipment_types,  } from "../../config.mjs";


const { HTMLField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

export class BasicActorData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            aspects : new SchemaField({
                might : new NumberField({ required: true, integer: true, initial: 0}),
                grace : new NumberField({ required: true, integer: true, initial: 0}),
                speed : new NumberField({ required: true, integer: true, initial: 0}),
                resilience : new NumberField({ required: true, integer: true, initial: 0}),
                intellect : new NumberField({ required: true, integer: true, initial: 0}),
                charm : new NumberField({ required: true, integer: true, initial: 0}),
                cunning : new NumberField({ required: true, integer: true, initial: 0}),
                tenacity : new NumberField({ required: true, integer: true, initial: 0})
            }),
            scrip: new NumberField({required: true, initial: 0}),
            characteristics : new StringField({required: true, initial: "Living"}),
            current_wounds : new NumberField({required: true, initial: 0})

        };
    }

    getAspectValue(aspect)
    {
        return this.aspects[aspect];
    }

    getSkill(skill_name)
    {
        return this.skills.find((skill) => skill.name == skill_name);
    }

    getSkillValue(skill_name)
    {
        return this.skills.find((skill) => skill.name == skill_name)?.rank ?? 0;
    }

    getTriggersForSkill(skill)
    {
        return this.getSkill(skill).triggers;
    }

    filterItems()
    {
        this.skills = foundry.utils.deepClone(this.parent.itemTypes["skill"]);
        //Now we do the triggers
        var triggers = foundry.utils.deepClone(this.parent.itemTypes["trigger"]);
        this.skills.forEach(skill => {
            var skill_triggers = triggers.filter((trigger) => trigger.system.skill == skill.uuid);
            triggers = triggers.filter((trigger) => !skill_triggers.includes(trigger));
            skill.triggers = skill_triggers;
        });
        this.talents = foundry.utils.deepClone(this.parent.itemTypes["talent"]);
        this.equipment = foundry.utils.deepClone(this.parent.itemTypes["equipment"]);
    }
    
    prepareDerivedData() {
        super.prepareDerivedData();
        this.filterItems();
    }
}

//Most actors (but not all) automatically derive their derived aspects
export class AutoDerivedActorData extends BasicActorData {

    getDerivedScalers()
    {
        const scalers = {};
        for(var key in derived_keys)
        {
            scalers[derived_keys[key]] = null;
        }
        //Default stuff
        let evade = this.getSkillValue("Evade");
        scalers["defense"] = this.aspects.speed > evade ? this.aspects.speed : evade;
        let centering = this.getSkillValue("Centering");
        scalers["willpower"] = this.aspects.tenacity > centering ? this.aspects.tenacity : centering;
        scalers["initiative"] = this.getSkillValue("Notice");
        scalers["wounds"] = this.getSkillValue("Toughness");
        for(var i in this.talents)
        {
            var talent = this.talents[i];
            if(talent.system.new_possible_derived_modifiers.length > 0)
            {
                for(var j in talent.system.new_possible_derived_modifiers)
                {
                    var modifier = talent.system.new_possible_derived_modifiers[j];
                    var rank = this.getSkillValue(modifier.skill);
                    if(rank != undefined)
                    {
                        if(scalers[modifier.for] == undefined || scalers[modifier.for] < rank)
                        {
                            scalers[modifier.for] = rank;
                        }
                    }
                }
            }
        }
        //Something here?
        return scalers;
    }

    prepareDerivedData() {
        super.prepareDerivedData();
        this.derived = {};
        this.skills.forEach((skill) => {
            skill.av = this.aspects[skill.system.aspect] + skill.system.rank;
        });
        for(var key in derived_keys)
        {
            this.derived[derived_keys[key]] = derived_initial_values[derived_keys[key]];

        }
        this.derived.initiative = this.aspects.speed;
        if(this.aspects.resilience > 0)
        {
            this.derived.wounds += Math.ceil(this.aspects.resilience/2);
        }
        this.derived.walk += Math.ceil(this.aspects.speed/2);
        this.derived.charge += this.aspects.speed;
        if(this.derived.charge < this.derived.walk)
        {
            this.derived.charge = this.derived.walk;
        }
        let scalers = this.getDerivedScalers();
        for (key in scalers){
            this.derived[key] += scalers[key]
        }
    }
}