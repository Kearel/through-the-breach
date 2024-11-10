export class SelectFewChoiceDialog extends Dialog {
    constructor(choices, data={}, options={})
    {
        super(data, options);
        this.choices = choices;
    }

    static create_choice(choices, title)
    {
        return new Promise(async (resolve, reject) => {
            const dialog = new this({
                title: title,
                content: await renderTemplate("systems/through-the-breach/templates/dialog/select-fiew-choice-dialog.hbs", {choices: choices}),
                buttons: {
                    cancel: {
                        label: 'Cancel',
                        callback: html => reject(null)
                    }
                },
                default: "submit",
                close: ()=> reject(null)
            });
            dialog.render(true);
        });
    }
}