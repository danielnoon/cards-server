import { repeat } from "itertools/itertools.js";
import {
  BUNNY,
  GECK,
  GRIZZLY,
  MANTIS,
  MANTIS_GOD,
  RAVEN,
  SQUIRREL,
  STOAT,
  WOLF,
  CAT,
} from "./cards.mjs";

const DECK_SIZE = 20;

const DECK_POOL = [
  ...repeat(SQUIRREL, 8),
  ...repeat(WOLF, 4),
  ...repeat(STOAT, 4),
  ...repeat(GRIZZLY, 2),
  ...repeat(GECK, 3),
  ...repeat(BUNNY, 3),
  ...repeat(RAVEN, 2),
  ...repeat(MANTIS, 3),
  ...repeat(MANTIS_GOD, 2),
  ...repeat(CAT, 2),
];

export function getDeck() {
  const pool = [...DECK_POOL];
  const deck = [SQUIRREL];

  for (let i = 0; i < DECK_SIZE - deck.length; i++) {
    const card = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    deck.push(card);
  }

  return deck;
}
