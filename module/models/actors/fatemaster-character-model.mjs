
const { HTMLField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

import { BasicActorData } from "./actor-models.mjs";

export class FatemasterCharacterData extends BasicActorData
{
    static defineSchema(){
        return foundry.utils.mergeObject(super.defineSchema(), {
            rank: new NumberField({initial:1, integer:true, nullable:false, required:true}),
            derived: new SchemaField({
                defense: new NumberField({initial:1, integer:true, nullable:false, required:true}),
                willpower: new NumberField({initial:1, integer:true, nullable:false, required:true}),
                walk: new NumberField({initial:1, integer:true, nullable:false, required:true}),
                charge: new NumberField({initial:1, integer:true, nullable:false, required:true}),
                height: new NumberField({initial:1, integer:true, nullable:false, required:true}),
                wounds: new NumberField({initial:1, integer:true, nullable:false, required:true}),
                initiative: new NumberField({initial:1, integer:true, nullable:false, required:true}),
            })
        });
    }
}