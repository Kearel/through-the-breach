import { aspect_dictionary, suit_to_font_awesome, tn_to_difficulty } from "../config.mjs";
import { draw_card } from "./draw-card.mjs";

export default class FateDuel
{

    static async createDuel(duelist, skill)
    {
        if(duelist.system.hand == "None" || duelist.system.deck == "None" || duelist.system.discard_pile == "None")
        {
            ui.notifications.error("Missing a deck. Regenerate decks.");
            return;
        } //This aint good
        var skill = duelist.system.getSkill(skill);
        renderTemplate('systems/through-the-breach/templates/dialog/start-duel-dialog.hbs',
            {
                aspects: aspect_dictionary,
                default_aspect: skill?.system.aspect ?? "might",
                skill: skill?.name ?? ""
            }
        ).then((html) => {
            new Dialog({
                title: "New Fate Duel",
                content: html,
                buttons : {
                    submit : {
                        label: 'Submit',
                        callback: html =>
                        {
                            this.initiateDuel(duelist, document.getElementById("skill").value, document.getElementById("aspect").value, Number(document.getElementById("difficulty").value), [], Number(document.getElementById("advantage").value), Number(document.getElementById("bonus").value))
                        }
                    },
                    cancel : {
                        label: 'Cancel'
                    }
                },
                render: (html) =>
                {
                    var difficulty = document.getElementById("difficulty");
                    var difftext = document.getElementById("difftext");
                    difftext.value = tn_to_difficulty(Number(difficulty.value));
                    difficulty.addEventListener("change", (event) => 
                    {
                        difftext.value = tn_to_difficulty(Number(difficulty.value));
                    });
                }
            }).render(true);
        })
    }

    static async initiateDuel(duelist, skill, aspect, target_number, target_suits, draw_advantage, bonus)
    {
        var drawing = 1 + Math.min(3, Math.abs(draw_advantage));
        var can_cheat = true;
        var drawn = await draw_card(drawing);
        var choices = foundry.utils.deepClone(drawn);
        var black_joker = drawn.find((card) => card.suit == "joker" && card.value == 0);
        if(black_joker) //You are required to use the black joker, irregardless of how you got it.
        {
            choices = [black_joker];
            can_cheat = false;
        } else if(draw_advantage < 0) //We have negative fate mods. Filter out the cards that we can't use. Remember: the red joker can ALWAYS be used.
        { //Technically the fatemaster is supposed to choose a negative fate mod, but being able to pop open a window for someone else is a hassle.
            //Also would be really annoying.
            can_cheat = false;

            const lowest = drawn.reduce((lowest, current) => {
                if(current.value < lowest.value)
                {
                    lowest = current;
                }
            });
            choices = drawn.filter((card) => card.suit == "joker" || card.value == lowest.value);
        }
        var hand = fromUuidSync(duelist.system.hand);
        var actual_skill = duelist.system.getSkill(skill);
        var triggers = [];
        if(actual_skill)
            triggers = duelist.system.getTriggersForSkill(skill);
        var context = {
            black_joker: !!black_joker,
            actor: duelist,
            bonus: bonus,
            aspect: aspect,
            aspect_value: duelist.system.getAspectValue(aspect),
            skill: skill,
            skill_value: actual_skill?.system.rank ?? 0,
            skill_suit: actual_skill?.system.suit ?? "",
            choices: choices,
            can_cheat: can_cheat,
            tn: target_number,
            ts: target_suits,
            advantage: draw_advantage,
            present_suits: []
        }
        if(actual_skill?.system.suit ?? "None" != "None")
        {
            context.present_suits.push(actual_skill.system.suit);
        }

        if((!can_cheat || hand.cards.size == 0) && choices.length == 1 && triggers.length == 0) //If we have no choices just skip to the results part. Maybe still dont? Maybe there are talents? For now skip.
        {
            var chosen_card = choices[0];
            context.present_suits.push(chosen_card.suit);
            this.showResults(
                foundry.utils.mergeObject(context, 
                {
                    chosen: chosen_card,
                    automatic: true
                })
            );
        } else {
            ChatMessage.create({
                content: game.user.name + " is choosing their card...",
                user: game.user.id
            });
            //Create a chat message with a button to reopen the choice window
            //Then open choice window
            this.showChoiceWindow(context, foundry.utils.deepClone(hand.cards.contents), triggers);
        }
    }

    static meets_success(context, value, suits) //Takes a context and sees if the values combined with values/suits meets the conditions
    {
        if(context.chosen)
        {
            value = context.chosen.value;
            suits = context.present_suits;
        }
        if(context.aspect_value + context.skill_value + context.bonus + value >= context.tn)
        {
            if(context.ts.length > 0)
            {
                var usable_suits = foundry.utils.duplicate(suits);
                for(var suit in context.ts)
                {
                    var index = usable_suits.findIndex((value) => value == suit);
                    if(index == -1)
                    {
                        return false;
                    }
                    usable_suits.splice(index, 1);
                }
            }
            return true;
        }
        return false;
    }

    static async showChoiceWindow(context, hand, triggers)
    {
        renderTemplate('systems/through-the-breach/templates/dialog/choose-card-dialog.hbs', {
            hand: context.can_cheat ? hand : false,
            triggers: triggers,
            choices: context.choices,
            tn: context.tn,
            ts: context.ts
        }).then((html) =>
        {
            new Dialog({
                title: "Fate Duel",
                content: html,
                buttons: {
                    select: {
                        label: 'Select',
                        callback: html => {
                            var element = document.getElementById("selected");
                            var card = fromUuidSync(element.dataset.card);
                            if(element.dataset.hand == "true") //Remove card from hand
                            {
                                var discard = fromUuidSync(context.actor.system.discard_pile);
                                card.pass(discard);
                            }
                            context.present_suits.push(card.suit);
                            var trig_id = document.getElementById("trigger").value;
                            var trigger = null;
                            if(trig_id != "None")
                            {
                                trigger = fromUuidSync(trig_id);
                            }
                            this.showResults(foundry.utils.mergeObject(context,
                                {
                                    chosen: card,
                                    trigger: trigger
                                }
                            ))
                        }
                    }
                },
                render: html => {
                    var changeResult = function(){
                        var res = document.getElementById("result");
                        var sel = document.getElementById("selected");
                        res.innerHTML = context.skill_value + context.aspect_value + context.bonus + Number(sel.dataset.value) + "<i class=\"fa " + suit_to_font_awesome[sel.dataset.suit] + "\"></i>";
                        if(context.present_suits.length > 0)
                        {
                            for(var suit in context.present_suits)
                            {
                                res.innerHTML += "<i class=\"fa " + suit_to_font_awesome[suit] + "\"></i>";
                            }
                        }
                        if(FateDuel.meets_success(context, Number(sel.dataset.value), context.present_suits.concat([sel.dataset.suit])))
                        {
                            res.style.color = "green";
                        } else {
                            res.style.color = "red";
                        }
                    }
                    changeResult();
                    html.find(".card").on("click", (event) => {
                        document.getElementById("selected").removeAttribute("id");
                        const t = event.currentTarget;
                        t.setAttribute("id", "selected");
                        changeResult();
                    })
                }
            },
            {
                width:600,
                height:535
            }).render(true);
        });
    }

    static async showResults(results)
    {
        results.success = this.meets_success(results);
        results.result = results.aspect_value + results.skill_value + results.bonus + results.chosen.value;
        var margin;
        if(results.success) //Have to do it this way as you can still fail if you don't meet suit requirements (For spells)
        {
            margin = Math.max(0, results.result - results.tn);
        } else {
            margin = Math.max(0, results.tn - results.result);
        }
        results.margin = Math.floor(margin/5);
        renderTemplate('systems/through-the-breach/templates/chat/duel-results.hbs', results).then(html => {
            ChatMessage.create({
                content: html,
                user: game.user.id,
                speaker: ChatMessage.getSpeaker({ actor: results.actor})
            });
        });
        return results;
    }

    constructor(u, d, dr, t, ts, s)
    {
        this._user = u;
        this._duelist = d;
        this._draw_advantage = dr;
        this.target_number = t;
        this.target_suits = ts;
        this.skill = s;
    }

    openWindow()
    {

        const dialog = new Dialog({
            title: "Choosing"
        })
    }

    addSuit(suit)
    {
        this._suits.push(suit);
    }

    get suits()
    {
        if(this.chosen_suit)
        {
            return this._suits.concat(this.chosen_suit);
        }
        return this._suits;
    }

    get duelist()
    {
        return fromUuid(_duelist);
    }

    get draw_advantage()
    {
        return Math.min(5, Math.max(-5, this._draw_advantage));
    }

}