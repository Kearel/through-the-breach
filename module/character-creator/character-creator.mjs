import { TarotReader } from "../models/apps/tarot-reader.mjs";
import { PursuitSelector } from "../models/apps/select-pursuit.mjs";
import {suits, suit_to_font_awesome} from "../config.mjs";

export class CharacterCreator {
    static startCreatorDialog(fated)
    {
        if(fated.system.fate_cards.length == 0)
        {
            this.startInitialDialog(fated);
        } else if(fated.system.pursuits == 0)
        {
            this.startPursuitSelector(fated);
        } else if(fated.system.twist_deck == 0)
        {
            this.startTwistDeckCreation(fated);
        } else {
            fated.system.generate_decks();
        }
    }

    static startInitialDialog(fated)
    {
        //Choose the tarot
        renderTemplate('systems/through-the-breach/templates/dialog/choose-tarot-dialog.hbs', {tarots: { "systems/through-the-breach/packs/tarots/cross-roads.json": "Cross Roads"}}).then((html) => {
            new Dialog({
                title: "Choose Tarot",
                content: html,
                buttons: {
                    continue: {
                        label: "Continue",
                        callback: html => {
                            fetch(document.getElementById("tarot").value).then(f => f.json()).then(data => {
                                var t = new TarotReader(fated, data);
                                t.start().then(creation => {
                                    var update = {system: {aspects: foundry.utils.mergeObject({}, creation.detail.body_aspects, creation.detail.mind_aspects), setup: true, scrip: 10}};
                                    var fate = [];
                                    creation.detail.fate.forEach(entry => {
                                        fate.push({
                                            suit: entry.suit,
                                            value: entry.value,
                                            fate: entry.fate,
                                            label: entry.label
                                        })
                                    });
                                    update.system.fate_cards = fate;
                                    fated.update(update).then(() => {
                                        var skills_to_create = [];
                                        creation.detail.skills.forEach(skill => {
                                            var s = fromUuidSync(skill.uuid).toObject();
                                            s.system.rank = skill.value;
                                            skills_to_create.push(s);
                                        });
                                        fated.createEmbeddedDocuments("Item", skills_to_create).then(()=> {
                                            this.startPursuitSelector(fated);
                                        });
                                    });
                                });
                            });
                        }
                    },
                    cancel: {
                        label: 'Cancel'
                    }
                }
            }).render(true);
        });
    }

    static startPursuitSelector(fated)
    {
        PursuitSelector.createPursuitSelector(fated, true).getSelectedPursuit().then(pursuit => {
            fated.system.add_new_pursuit(pursuit).then(() => this.startTwistDeckCreation(fated));
        });
    }

    static startTwistDeckCreation(fated)
    {
        var options = [""];
        suits.forEach((suit) => {
            options.push(suit);
        });
        renderTemplate('systems/through-the-breach/templates/dialog/create-twist-deck-dialog.hbs', {choices: options}).then(html => {
            new Dialog({
                title: "Twist Deck",
                content: html,
                buttons: {
                    cancel: {
                        label: 'Cancel'
                    },
                    done: {
                        label: 'Done',
                        callback: html => {
                            var def = document.getElementById("def").selectedIndex;
                            var asc = document.getElementById("asc").selectedIndex;
                            var center = document.getElementById("center").selectedIndex;
                            var desc = document.getElementById("desc").selectedIndex;
                            var values = [def, asc, center, desc];
                            if(![1, 2, 3, 4].every(val => values.includes(val)))
                            {
                                throw new Error('You must have each suit assigned to a different set.');
                            }

                            var fate_deck = [];
                            //Hardcoded for now. Or maybe forever. Doesn't seem to change based on expansion.
                            var def_suit = suits[def - 1];
                            var asc_suit = suits[asc - 1];
                            var center_suit = suits[center - 1];
                            var desc_suit = suits[desc - 1];
                            var twist_deck = [];
                            [1,5,9,13].forEach((val) => {
                                twist_deck.push({
                                    suit: def_suit,
                                    value: val
                                })
                            });
                            [4,8,12].forEach((val) => {
                                twist_deck.push({
                                    suit: asc_suit,
                                    value: val
                                })
                            });
                            [3,7,11].forEach((val) => {
                                twist_deck.push({
                                    suit: center_suit,
                                    value: val
                                })
                            });
                            [2,6,10].forEach((val) => {
                                twist_deck.push({
                                    suit: desc_suit,
                                    value: val
                                })
                            });
                            fated.update({system: {twist_deck: twist_deck}}).then(() => {
                                fated.system.generate_decks();
                            });
                        }
                    }
                }
            }).render(true);
        });
    }
}