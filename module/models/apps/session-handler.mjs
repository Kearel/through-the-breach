export class SessionHandler extends Application
{
    static get defaultOptions(){
        return foundry.utils.mergeObject(super.defaultOptions, {
            popOut: false,
            minimizable: false,
            resizable: false,
            id:"session_handler",
            template: "systems/through-the-breach/templates/apps/session-handler.hbs"
        });
    }

    getData(){
        var context = super.getData();
        context.sessionStage = game.settings.get("through-the-breach", "sessionStage");
        return context;
    }

    activateListeners(html) {
        html.find(".sessionToggle").on("click", (event) => {
            var stage = game.settings.get("through-the-breach", "sessionStage");
            switch(stage)
            {
                case TTB.session_stage_prologue:
                    stage = TTB.session_stage_adventure;
                    game.settings.set("through-the-breach", "sessionStage", TTB.session_stage_adventure);
                    break;
                case TTB.session_stage_adventure:
                    stage = TTB.session_stage_epilogue;
                    game.settings.set("through-the-breach", "sessionStage", TTB.session_stage_epilogue);
                    break;
                case TTB.session_stage_epilogue:
                    stage = TTB.session_stage_prologue;
                    game.settings.set("through-the-breach", "sessionStage", TTB.session_stage_prologue);
                    break;
            }
            
            ChatMessage.create({
                content: "<h1>Starting " + stage + "</h1>",
                user: game.user.id
            });

            document.getElementById("session_stage").innerHTML = "Stage: " + stage;

            game.actors.contents.forEach( (actor) => {
                if(actor.system.active_player)
                {
                    actor.system.trigger_session_change(stage);
                }
            });
        });
    }

    _injectHTML(html)
    {
        html.insertAfter(document.getElementById("hotbar"));
    }
}