const { BooleanField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

export class MagiaData extends foundry.abstract.TypeDataModel {
    static defineSchema()
    {
        return {
            school: new StringField({initial: "enchanting", required: true}),
            aspect: new StringField({initial: "might", required:true}),
            ap_cost: new NumberField({initial: 0, integer: true, required:true }),
            target_number: new SchemaField({
                value: new NumberField({initial: 0, integer: true, required: true}),
                suit: new StringField({initial: "rams", required:true, blank:false})
            }),
            resist_aspect: new StringField({initial: "might", required:false}),
            range: new NumberField({initial: 1, integer: true, required: true}),
            melee: new BooleanField({initial: false, required: true}),
            blurb: new StringField({initial: "Blurb", required:true}),
            description: new StringField({initial:"Effect Desc", required:true}),
            origin: new StringField({initial:"", required:false})
        }
    }
}