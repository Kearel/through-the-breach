const { BooleanField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

export class ImmutoData extends foundry.abstract.TypeDataModel {
    static defineSchema()
    {
        return {
            school: new StringField({initial: "alteration", required:true}),
            description: new StringField({initial:"Description", required:true}),
            target_number_modifier: new NumberField({initial:0, required:true, integer:true}),
            origin: new StringField({initial:"", required:false})
        }
    }
}