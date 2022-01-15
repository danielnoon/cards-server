import immer from "immer";

const produce = immer.default;

export function fight(game, playerId) {
  const opponent = game.getOpponent(playerId);

  return produce(game, (draft) => {
    for (const card of draft.play[playerId]) {
      if (card !== null) {
        const cardState = draft.cards.get(card);
        const opponentCard = draft.play[opponent.id][cardState.slot];

        console.log("opponent card", opponentCard);

        if (opponentCard === null) {
          opponent.damage += cardState.attack;
        } else {
          const opponentCardState = draft.cards.get(opponentCard);
          opponentCardState.damage += cardState.attack;
          if (opponentCardState.damage >= opponentCardState.data.health) {
            draft.play[opponent.id][cardState.slot] = null;
          }
        }
      }
    }
  });
}
