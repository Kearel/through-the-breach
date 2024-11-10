const { HTMLField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

export class PursuitData extends TalentData {
    static defineSchema() {
        return foundry.utils.mergeObject(super.defineSchema(), {
            description: new StringField({
                required: true, initial: "Description", blank: false
            }),
            starting_with: new StringField({
                required: true, initial: "", blank: true
            }),
            talents_by_rank: new ArrayField(
                new ArrayField(
                        new StringField({
                        required:true, initial: "", blank: true
                    })
                )
            ),
            rank: new NumberField({initial: 0, min: 0, integer: true})
        });
    }

    prepareDerivedData()
    {
        super.prepareDerivedData();
        this.talents = [];
        
        this.talents_by_rank.forEach((pool) => {
            var inner = {};
            if(pool != "")
            {
                pool.forEach((uuid) => {
                    if(uuid == TTB.general_talent_id)
                    {
                        inner[uuid] = "General Talent";
                    } else {
                        var a = fromUuidSync(uuid);
                        if(a)
                        {
                            inner[uuid] = a.name;
                        } else {
                            inner[uuid] = "UUID NOT FOUND";
                        }
                    }
                });
            }
            this.talents.push(inner);
        });
    }
}
