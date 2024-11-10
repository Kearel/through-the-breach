const { HTMLField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

export class TriggerData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new StringField({
                required: true, initial: "Description", blank: false
            }),
            suit:  new StringField({
                required: true, initial: "rams", blank: false
            }),
            skill: new StringField({
                required: true, initial: "Skill", blank: false
            })
        }
    }
}
