const sigils = new Map();

export default sigils;

const BifurcatedStrike = {
  id: "bifurcated_strike",
  name: "Bifurcated Strike",
  onAttack: (game, playerId, cardId) => {
    const card = game.cards.get(cardId);
    const opponent = game.getOpponent(playerId);
    const targets = [card.slot + 1, card.slot - 1].filter(
      (slot) => slot >= 0 && slot < 4
    );

    for (const target of targets) {
      const opponentCard = game.play[opponent.id][target];
      const opponentCardState = game.cards.get(opponentCard);

      if (opponentCard) {
        opponentCardState.damage += card.data.attack;

        if (opponentCardState.damage >= opponentCardState.data.health) {
          game.play[opponent.id][target] = null;
        }
      } else {
        opponent.damage += card.attack;
      }
    }
  },
};

sigils.set(BifurcatedStrike.id, BifurcatedStrike);

const Trifurcated = {
  id: "trifurcated_strike",
  name: "Trifurcated Strike",
  onAttack: (game, playerId, cardId) => {
    const card = game.cards.get(cardId);
    const opponent = game.getOpponent(playerId);
    const targets = [card.slot + 1, card.slot - 1].filter(
      (slot) => slot >= 0 && slot < 4
    );

    for (const target of targets) {
      const opponentCard = game.play[opponent.id][target];
      const opponentCardState = game.cards.get(opponentCard);

      if (opponentCard) {
        opponentCardState.damage += card.data.attack;

        if (opponentCardState.damage >= opponentCardState.data.health) {
          game.play[opponent.id][target] = null;
        }
      } else {
        opponent.damage += card.attack;
      }
    }
  },
};

sigils.set(Trifurcated.id, Trifurcated);
