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
} from "./cards.mjs";

const DECK_SIZE = 20;

const DECK_POOL = [
  ...repeat(SQUIRREL, 6),
  ...repeat(WOLF, 4),
  ...repeat(STOAT, 4),
  ...repeat(GRIZZLY, 2),
  ...repeat(GECK, 3),
  ...repeat(BUNNY, 3),
  ...repeat(RAVEN, 2),
  ...repeat(MANTIS, 3),
  ...repeat(MANTIS_GOD, 2),
];

export function getDeck() {
  const pool = [...DECK_POOL];
  const deck = [SQUIRREL, MANTIS, MANTIS_GOD];

  for (let i = 0; i < DECK_SIZE; i++) {
    const card = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    deck.push(card);
  }

  return deck;
}
