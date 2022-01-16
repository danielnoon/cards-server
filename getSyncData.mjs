export function getSyncData(game, player) {
  const playerData = game[player];
  const opponentData = game.getOpponent(player);

  return {
    playerHand: playerData.hand.map((id) => game.cards.get(id)),
    playerDamage: playerData.damage,
    playerBones: playerData.bones,
    playerPlay: game.play[player],
    opponentPlay: game.play[opponentData.id],
    opponentDamage: opponentData.damage,
  };
}
