import { immerable } from "immer";
import { GECK, GRIZZLY, SQUIRREL, STOAT, WOLF } from "./cards.mjs";

export class CardState {
  constructor(id, card) {
    this.id = id;
    this.data = card;

    this.damage = 0;
  }

  slot = 0;

  get blood() {
    return 1;
  }

  get attack() {
    return this.data.attack;
  }
}

export class PlayerState {
  constructor(id, deck) {
    this.id = id;
    this.damage = 0;
    this.bones = 0;
    this.gems = [false, false, false];
    this.energy = 0;
    this.deck = deck;
    this.hand = [];
  }
}

export class GameState {
  constructor(gameId, player1, player2) {
    this.id = gameId;
    this.id1 = player1;
    this.id2 = player2;
    this.turn = player1;
    this.play = {
      [player1]: [null, null, null, null],
      [player2]: [null, null, null, null],
    };
    this[player1] = new PlayerState(player1, [
      SQUIRREL,
      STOAT,
      WOLF,
      GECK,
      GRIZZLY,
    ]);
    this[player2] = new PlayerState(player2, [
      SQUIRREL,
      STOAT,
      WOLF,
      GECK,
      GRIZZLY,
    ]);
    this.opponents = new Map([
      [player1, this[player2]],
      [player2, this[player1]],
    ]);
    this[immerable] = true;
    this.valid = true;
    this.cards = new Map();
    this.currentId = 0;
    this.firstTurn = true;
    this.phase = "play";
  }

  getOpponent(id) {
    return this.opponents.get(id);
  }

  drawCard(playerId) {
    const player = this[playerId];
    const cardData = player.deck.shift();
    const card = this.createCard(cardData);
    player.hand.push(card.id);
    return card;
  }

  createCard(card) {
    const id = this.currentId++;
    this.cards.set(id, new CardState(id, card));
    return this.cards.get(id);
  }

  getHand(playerId) {
    return this[playerId].hand.map((id) => this.cards.get(id));
  }
}

export function drawCard(game, playerId) {
  const player = game[playerId];
  const cardData = player.deck.shift();
  const card = createCard(game, cardData);
  player.hand.push(card.id);
}

export function createCard(game, card) {
  const id = game.currentId++;
  game.cards.set(id, new CardState(id, card));
  return game.cards.get(id);
}
