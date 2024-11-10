const { BooleanField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

export class EquipmentData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            type: new StringField({initial:"Gear", required:true}),
            cost: new NumberField({initial:0, min:0, required:true}),
            count: new NumberField({initial:1, min:0, required:true, interger:true}),
            special: new ArrayField(
                new StringField({initial:"Special", required:true})
            ),
            modifications: new ArrayField(
                new StringField({intitial: "ModID", required:true})
            ),
            hidden_tags: new ArrayField(
                new StringField({initial:"Special", required:true})
            ),
            crafting: new SchemaField({
                skill: new StringField({initial:"None", required:true}), //Skill to create the item/mod
                rank: new NumberField({initial:0, min:0, integer:true, required:true}) //This can go up depending on # of mods
            }),
            attacks: new ArrayField(
                new SchemaField({
                    melee: new BooleanField({initial:true, required:true}),
                    range: new NumberField({initial:1, integer:true}),
                    weak_damage: new NumberField({initial:1, integer:true}),
                    moderate_damage: new NumberField({initial:1, integer:true}),
                    severe_damage: new NumberField({initial:1, integer:true}),
                    skill: new StringField({initial:"Skill", required:true})
                })
            ),
            spells: new ArrayField(
                new StringField({initial:"SpellID", required:true})
            ),
            equipped: new BooleanField({initial: false, required:true})
        }
    }

    isGrimoire()
    {
        return this.system.spells.length > 0;
    }

    prepareDerivedData()
    {
        this.derived_attacks = foundry.utils.deepClone(this.attacks);
        for(var attack in this.derived_attacks)
        {
            this.derived_attacks[attack].builtin = true;
        }
        this.derived_specials = [];
        for(var s in this.special)
        {
            this.derived_specials.push({tag: this.special[s], builtin: true});
        }
        this.modification_info = [];
        for(var mod in this.modifications)
        {
            var item = fromUuidSync(this.modifications[mod]);
            for(var attack in item.system.attacks)
            {
                var n_attack = foundry.utils.deepClone(item.system.attacks[attack]);
                n_attack.builtin = false;
                this.derived_attacks.push(n_attack)
            }

            for(var tag in item.system.special)
            {
                this.derived_specials.push({tag: item.system.special[tag], builtin: false});
            }
            this.modification_info.push({name: item.name, uuid: this.modifications[mod], icon: item.img});
        }
    }
}