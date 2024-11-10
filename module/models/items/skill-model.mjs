const { HTMLField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

export class SkillData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new StringField({
                required: true, initial: "Description", blank: false
            }),
            blurb: new StringField({
                required: true, initial: "Blurb", blank: false
            }),
            aspect:  new StringField({
                required: true, initial: "Aspect", blank: false
            }),
            alternate_aspect: new StringField({
                required: true, initial: "Aspect"
            }),
            category: new StringField({
                required: true, initial: "Academic", blank: false
            }),
            rank: new NumberField({initial:0, integer:true}),
            suit: new StringField({
                required: false, initial: "None", blank:false
            })
        }
    }
}
