import { AutoDerivedActorData } from "./actor-models.mjs";

const { BooleanField, NumberField, SchemaField, StringField, ArrayField } = foundry.data.fields;

export class FatedActorData extends AutoDerivedActorData {
    static defineSchema(){
        return foundry.utils.mergeObject(super.defineSchema(), {
            level_up: new BooleanField({required: true, initial:false}),
            xp: new NumberField({required: true, initial: 0, integer: true}),
            current_pursuit: new StringField({required: true, initial:"", blank:true}), //uuid maybe? 
            station: new StringField({required: true, initial:"Station"}),
            experience_points: new NumberField({required: true, initial: 0, min: 0, integer:true}),
            fate_cards: new ArrayField(
                new SchemaField({
                    suit: new StringField({required: true, initial: "Masks"}),
                    value: new NumberField({required: true, initial: 0}),
                    fate: new StringField({required: true, initial: "Nothing happens everyone is happy :)"}),
                    label: new StringField({required: true, initial: "Boring"})
                })
            ),
            attuned: new ArrayField(
                new StringField({initial: "GrimoireID"})
            ),
            active_player: new BooleanField({required: true, initial: false}),
            cheat_deck: new StringField({required: true, initial:"None"}),
            hand: new StringField({required: true, initial: "None"}),
            discard_pile : new StringField({required: true, initial: "None"}),
            twist_deck: new ArrayField( //We keep this in case the decks get deleted/messed with somehow
                new SchemaField({
                    suit: new StringField({required: true, initial: "Masks"}),
                    value: new NumberField({required: true, initial: 0})
                })
            )
        })
    }

    filterItems()
    {
        super.filterItems();
        this.pursuits = foundry.utils.deepClone(this.parent.itemTypes["pursuit"]);
    }

    async generate_decks()
    {
        if(this.parent.system.twist_deck.length == 0)
        {
            //Probably call an error here.
            return;
        }
        //Generate whichever we don't have
        var gen_cheat = true;
        if(this.parent.system.cheat_deck != "None")
        {
            var deck = fromUuidSync(this.parent.system.cheat_deck);
            if(deck != null)
            {
                gen_cheat = false;
            }
        }

        var gen_hand = true;
        if(this.parent.system.hand != "None")
        {
            var deck = fromUuidSync(this.parent.system.hand);
            if(deck != null)
            {
                gen_hand = false;
            }
        }

        var gen_discard = true;
        if(this.parent.system.discard_pile != "None")
        {
            var deck = fromUuidSync(this.parent.system.discard_pile);
            if(deck != null)
            {
                gen_discard = false;
            }
        }

        const system_updates = {};

        if(gen_cheat)
        {
            var preset = CONFIG.Cards.presets[TTB.actor_hand_preset];
            const presetData = await fetch(preset.src).then(r => r.json());
            presetData.name = "Cheat Deck - " + this.parent.name;
            presetData.cards = presetData.cards.filter((card) => this.parent.system.twist_deck.some((c) => c.suit == card.suit && c.value == card.value)); //Filter out the cards that aren't in our list
            var deck = await Cards.implementation.create(presetData);
            system_updates["cheat_deck"] = deck.uuid;
        }
        if(gen_hand)
        {
            var hand_data = {
                name: "Hand - " + this.parent.name,
                type: "hand",
                cards: []
            }
            var deck = await Cards.implementation.create(hand_data);
            system_updates["hand"] = deck.uuid;
        }

        if(gen_discard)
        {
            var discard_data = {
                name: "Discard Pile - " + this.parent.name,
                type: "pile",
                cards: []
            }
            var deck = await Cards.implementation.create(discard_data);
            system_updates["discard_pile"] = deck.uuid;
        }

        if(gen_cheat || gen_hand || gen_discard)
        {
            await this.parent.update({system: system_updates});
            ChatMessage.create({
                content: "Generated Fate Deck/Hand/Discard for " + fated.name,
                user: game.userId
            });
        }
    }

    trigger_session_change() {
        this.parent.update({system: {level_up: true}});
    }

    async add_new_pursuit(pursuit_uuid) //Adds a copy of this pursuit to our model
    {
        var p = fromUuidSync(pursuit_uuid).toObject();
        var t = fromUuidSync(p.system.talents_by_rank[0][0]).toObject(); //Get the first talent
        this.parent.createEmbeddedDocuments([p]).then(pur => { //Do it seperate in case the array is non-stable
            this.parent.update({system: {current_pursuit: pur[0].uuid}}).then(() => {
                this.parent.createEmbeddedDocuments([t]);
            });
        });
    }

    async select_pursuit_as_current(pursuit_uuid)
    {
        await this.parent.update({system: {current_pursuit: pursuit_uuid}});
    }
}