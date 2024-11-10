const { HTMLField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

export class TalentData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            description: new StringField({
                required: true, initial: "Description", blank: false
            }),
            origin: new StringField({
                required: true, initial: "Origin", blank: false
            }),
            requirements: new ArrayField(
                new SchemaField({
                    plaintext: new StringField({
                        required: true, initial: "Requirement", blank: false
                    }),
                    against: new StringField({
                        required: true, initial:".", blank:false
                    }),
                    value: new StringField({
                        required: true, initial:"0", blank:false
                    }),
                    operation: new StringField({
                        required: true, initial:"=", blank:false
                    })
                })
            ),
            modificatons: new ArrayField(
                new SchemaField({
                    operation: new StringField({
                        required: true, initial:"addbonus", blank:false
                    }),
                    against: new StringField({
                        required: true, initial:".", blank:false
                    }),
                    value: new StringField({
                        required: true, initial:"0", blank:false
                    })
                })
            ),
            new_possible_derived_modifiers: new ArrayField( //Adds a new possible modifier to a derived aspect.
                new SchemaField({
                    for: new StringField({
                        required: true, initial:"defense", blank:false
                    }),
                    skill: new StringField({
                        required: true, initial:"skill", blank:false
                    })
                })
            )

        }
    }
}
