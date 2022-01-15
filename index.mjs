import { WebSocketServer } from "ws";
import immer, { enableAllPlugins } from "immer";
import { drawCard, GameState } from "./gameState.mjs";
import { verifyTurn } from "./verifyTurn.mjs";
import { fight } from "./fight.mjs";

const produce = immer.default;
enableAllPlugins();

const ws = new WebSocketServer({
  port: process.env.PORT || 3000,
});

let currentClientId = 0;
let currentGameId = 0;

const clients = new Map();
const waiting = [];

// map from gameId to gameState
const games = new Map();

// map from playerId to gameId
const players = new Map();

function updateGame(gameId, producer) {
  games.set(gameId, produce(games.get(gameId), producer));
}

ws.addListener("listening", () => {
  console.log("websocket server listening!");
});

ws.addListener("connection", (client) => {
  const id = currentClientId++;
  console.log(`client ${id} connected`);

  clients.set(id, client);

  client.addListener("message", (message) => {
    const data = JSON.parse(message.toString());

    if (data.type === "ready") {
      if (games.has(id)) {
        console.log(`client ${id} is already in a game`);
        client.send(
          JSON.stringify({ type: "error", message: "already in game" })
        );
        return;
      }

      console.log(`client ${id} is ready`);
      waiting.push(id);

      if (waiting.length === 2) {
        const gameId = currentGameId++;
        const [id1, id2] = waiting;
        waiting.length = 0;

        const game = new GameState(gameId, id1, id2);

        games.set(gameId, game);
        players.set(id1, gameId);
        players.set(id2, gameId);

        for (let i = 0; i < 4; i++) {
          game.drawCard(id1);
          game.drawCard(id2);
        }

        clients
          .get(id1)
          .send(JSON.stringify({ type: "start", hand: game.getHand(id1) }));
        clients
          .get(id2)
          .send(JSON.stringify({ type: "start", hand: game.getHand(id2) }));

        clients.get(id1).send(JSON.stringify({ type: "begin_initial_turn" }));
      }
    }

    if (data.type === "commit_turn") {
      const gameId = players.get(id);
      const game = games.get(gameId);

      if (!game) {
        client.send(JSON.stringify({ type: "error", message: "no game" }));
        return;
      }

      if (game.phase !== "play") {
        client.send(
          JSON.stringify({ type: "error", message: "not your turn" })
        );
        return;
      }

      if (game.turn === id) {
        const opponentId = game.getOpponent(id).id;
        const opponentClient = clients.get(opponentId);

        const { actions } = data;
        const valid = verifyTurn(game, id, actions);

        if (valid) {
          games.set(game.id, fight(valid, id));

          client.send(JSON.stringify({ type: "commit_turn_success" }));

          if (game.firstTurn) {
            opponentClient.send(
              JSON.stringify({ type: "begin_initial_turn", actions })
            );

            updateGame(game.id, (draft) => {
              draft.firstTurn = false;
            });
          } else {
            const phase =
              games.get(game.id)[id].hand.length === 0 ? "play" : "draw";

            updateGame(game.id, (draft) => {
              draft.phase = phase;
            });

            opponentClient.send(
              JSON.stringify({ type: "begin_turn", actions, phase })
            );
          }
        } else {
          client.send(
            JSON.stringify({ type: "error", message: "invalid actions" })
          );
        }
      } else {
        console.log(
          `client ${id} tried to commit turn when it wasn't their turn`
        );
        client.send(
          JSON.stringify({ type: "error", message: "not your turn" })
        );
      }
    }

    if (data.type === "draw_card") {
      const gameId = players.get(id);
      const game = games.get(gameId);

      if (!game) {
        console.log(`client ${id} tried to draw card when no game exists`);
        client.send(JSON.stringify({ type: "error", message: "no game" }));
        return;
      }

      if (game.phase !== "draw") {
        console.log(`client ${id} tried to draw card when not in draw phase`);
        client.send(
          JSON.stringify({ type: "error", message: "not your turn" })
        );
        return;
      }

      if (game.turn === id) {
        console.log("client", id, "is drawing a card");
        updateGame(game.id, (draft) => {
          drawCard(draft, id);
          draft.phase = "play";
        });

        const hand = games.get(game.id).getHand(id);

        console.log(hand.map((c) => c.id));

        client.send(JSON.stringify({ type: "draw_card", hand }));
      } else {
        console.log(
          `client ${id} tried to draw card when it wasn't their turn`
        );
        client.send(
          JSON.stringify({ type: "error", message: "not your turn" })
        );
      }
    }
  });

  client.addListener("close", () => {
    console.log(`client ${id} disconnected`);
    if (players.get(id)) {
      const gameId = players.get(id);

      if (gameId) {
        const game = games.get(gameId);
        const opponentId = game.getOpponent(id).id;
        const opponentClient = clients.get(opponentId);
        opponentClient.send(JSON.stringify({ type: "opponent_disconnected" }));
        games.delete(gameId);
      }
      players.delete(id);
    }
  });
});
