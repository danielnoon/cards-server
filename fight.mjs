import immer from "immer";
import sigils from "./sigils.mjs";

const produce = immer.default;

export function fight(game, playerId) {
  return produce(game, (draft) => {
    const opponent = game.getOpponent(playerId);

    for (const card of draft.play[playerId]) {
      if (card !== null) {
        const cardState = draft.cards.get(card);

        const sigilData = cardState.data.sigils
          .map((sigil) => sigils.get(sigil))
          .filter((sigil) => sigil && sigil.onAttack);

        if (sigilData.length > 0) {
          sigilData.forEach((sigil) => sigil.onAttack(draft, playerId, card));
          return;
        }

        const opponentCard = draft.play[opponent.id][cardState.slot];

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
