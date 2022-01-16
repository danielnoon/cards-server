import immer from "immer";

const produce = immer.default;

export function verifyTurn(state, playerId, actions) {
  if (state.turn !== playerId) {
    throw new Error(`It is not ${playerId}'s turn`);
  }

  const newState = produce(state, (draft) => {
    for (const action of actions) {
      if (action.type === "place_card") {
        const { id, position, sacrifices, card: attestedCard } = action;

        // check if the card is in the player's hand
        if (!draft[playerId].hand.includes(id)) {
          console.error(`${id} is not in ${playerId}'s hand`);
          draft.valid = false;
          return;
        }

        // check if card exists in the game
        if (!draft.cards.has(id)) {
          console.error(`${id} is not in the game`);
          draft.valid = false;
          return;
        }

        // check if the card id is the same in the attested card
        if (attestedCard.id !== draft.cards.get(id).data.id) {
          console.error(`${id} is not the same card as ${card.id}`);
          draft.valid = false;
          return;
        }

        // check if sacrifices are in player's play
        for (const sacrifice of sacrifices || []) {
          if (draft.play[playerId][sacrifice] === null) {
            console.error(`${sacrifice} is not in ${playerId}'s play`);
            draft.valid = false;
            return;
          }
        }

        // check if there are repeated cards in the sacrifices
        const repeatedSacrifices = new Set(sacrifices || []);
        if (repeatedSacrifices.size !== sacrifices.length) {
          console.error(`there are repeated cards in sacrifices`);
          draft.valid = false;
          return;
        }

        // check if card's cost is met
        const card = draft.cards.get(id);
        const cost = card.data.cost;

        if (card.data.cost_type === "blood") {
          const sacBlood = sacrifices.reduce((acc, sacrifice) => {
            const id = draft.play[playerId][sacrifice];

            if (id !== null && draft.cards.has(id)) {
              const card = draft.cards.get(id);
              const blood = card.blood;

              if (!card.data.sigils.includes("many_lives")) {
                draft[playerId].bones += 1;
                draft.play[playerId][sacrifice] = null;
              }

              return acc + blood;
            } else {
              return -1;
            }
          }, 0);

          if (sacBlood < cost) {
            console.error(
              `${id} requires ${cost} blood, but ${sacBlood} were sacrificed`
            );
            draft.valid = false;
            return;
          }
        } else if (card.data.cost_type === "bones") {
          if (draft[playerId].bones < cost) {
            console.error(
              `${id} requires ${cost} bones, but  player only has ${draft[playerId].bones}`
            );
            draft.valid = false;
            return;
          }
        }

        // check if there is empty space
        if (draft.play[playerId][position] !== null) {
          console.error(`Position ${position} is already occupied`);
          draft.valid = false;
          return;
        }

        // place the card
        draft[playerId].hand.splice(draft[playerId].hand.indexOf(id), 1);
        draft.play[playerId][position] = id;
        draft.cards.get(id).slot = position;
      }
    }

    draft.turn = draft.opponents.get(playerId).id;
  });

  if (newState.valid) {
    console.log("turn is valid");
    return newState;
  } else {
    console.error("turn is invalid");
    return false;
  }
}
