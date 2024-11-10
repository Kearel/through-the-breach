export async function draw_card(num_of_cards)
{
    var deck = game.cards.get(game.settings.get("through-the-breach", "fateDeck"));
    var discard = game.cards.get(game.settings.get("through-the-breach", "fateDiscard"));
    if(deck.cards.size - deck.drawnCards.length < num_of_cards)
    {
        await deck.recall({chatNotification:false});
        await deck.shuffle({chatNotification:false});
        ChatMessage.create({
            user: game.user.id,
            content: discard.link + " shuffled back into " + deck.link
        });
    }
    var c = await discard.draw(deck, num_of_cards, {chatNotification:false});
    ChatMessage.create({
        user: game.user.id,
        content: "Drew " + num_of_cards + " from " + deck.link,
        sound: "systems/through-the-breach/assets/559531__johnny2810__card.mp3"
    });
    return c;
}