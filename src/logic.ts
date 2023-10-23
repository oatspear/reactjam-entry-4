// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { Players, RuneClient } from "rune-games-sdk/multiplayer"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------


const TIME_PER_TURN: number = 45;  // seconds

const VICTORY_POINT_DIFF: number = 3;
const RESOURCES_PER_TURN: number = 2;
const MAX_TIER: number = 3;
export const COST_UPGRADE: number = 5;

export enum GameplayPhase {
  INITIAL,
  PLAYER_INPUT,
  COMBAT_STEP,
  COMBAT_RESULT,
}

export enum MinionType {
  POWER = 1,
  SPEED = 2,
  TECHNICAL = 3,
}

export enum Formation {
  POWER_SPEED_TECHNICAL = 1,
  POWER_TECHNICAL_SPEED,
  SPEED_POWER_TECHNICAL,
  SPEED_TECHNICAL_POWER,
  TECHNICAL_POWER_SPEED,
  TECHNICAL_SPEED_POWER,
}

export enum PlayerIndex {
  NONE = -1,
  PLAYER1 = 0,
  PLAYER2 = 1,
}


export function removeItem<T>(array: Array<T>, value: T): Array<T> { 
  const index = array.indexOf(value);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
}


// -----------------------------------------------------------------------------
// Army State
// -----------------------------------------------------------------------------


export interface ArmyState {
  type: MinionType;
  minions: number;
  tier: number;
  production: number;
}


function newArmyState(type: MinionType): ArmyState {
  return { type, minions: 0, tier: 1, production: 1 }
}


// -----------------------------------------------------------------------------
// Player State
// -----------------------------------------------------------------------------


export interface PlayerState {
  id: string;
  index: PlayerIndex;
  resources: number;
  formation: Formation;
  power: ArmyState;
  speed: ArmyState;
  technical: ArmyState;
  victoryPoints: number;
  ready: boolean;
  damageMultiplier: number;
}


function newPlayerState(id: string, index: PlayerIndex): PlayerState {
  return {
    id,
    index,
    resources: RESOURCES_PER_TURN,
    formation: Formation.POWER_SPEED_TECHNICAL,
    power: newArmyState(MinionType.POWER),
    speed: newArmyState(MinionType.SPEED),
    technical: newArmyState(MinionType.TECHNICAL),
    victoryPoints: 0,
    ready: false,
    damageMultiplier: 1,
  };
}


function getPlayerArmy(player: PlayerState, type: MinionType): ArmyState {
  switch (type) {
    case MinionType.POWER:
      return player.power;
    case MinionType.SPEED:
      return player.speed;
    case MinionType.TECHNICAL:
      return player.technical;
  }
}


function getArmiesByFormation(player: PlayerState): ArmyState[] {
  switch (player.formation) {
    case Formation.POWER_TECHNICAL_SPEED:
      return [player.power, player.technical, player.speed]
    case Formation.SPEED_POWER_TECHNICAL:
      return [player.speed, player.power, player.technical]
    case Formation.SPEED_TECHNICAL_POWER:
      return [player.speed, player.technical, player.power]
    case Formation.TECHNICAL_POWER_SPEED:
      return [player.technical, player.power, player.speed]
    case Formation.TECHNICAL_SPEED_POWER:
      return [player.technical, player.speed, player.power]
    default:
      return [player.power, player.speed, player.technical]
  }
}


// -----------------------------------------------------------------------------
// Combat State
// -----------------------------------------------------------------------------


export interface CombatState {

}


// -----------------------------------------------------------------------------
// Game State
// -----------------------------------------------------------------------------


export interface CombatStep {
  index: number;
  winner: PlayerIndex;
}


export interface GameState {
  phase: GameplayPhase;
  timer: number;
  turnsTaken: number;
  players: PlayerState[];
}


export function getPlayerIndex(game: GameState, playerId: string | undefined): PlayerIndex {
  if (!playerId) { return PlayerIndex.NONE }
  for (const player of game.players) {
    if (player.id === playerId) {
      return player.index;
    }
  }
  return PlayerIndex.NONE;
}


// -----------------------------------------------------------------------------
// Game Logic - Deploying
// -----------------------------------------------------------------------------


function validateDeployCommand(
  game: GameState,
  playerId: string,
  minion: MinionType
): PlayerState {
  console.log("Validate Deploy")
  const playerIndex: PlayerIndex = getPlayerIndex(game, playerId);
  // can the player issue deploy commands?
  if (playerIndex === PlayerIndex.NONE) { throw Rune.invalidAction() }
  console.log("Deploy Check 1")
  const player: PlayerState = game.players[playerIndex];
  console.log("Current player:", player.id)
  console.log("Action player:", playerId)
  console.log("Game Phase:", game.phase)
  console.log("Minion Type:", minion)
  console.log("Player Resources:", player.resources)
  // is the game accepting deploy commands?
  if (game.phase != GameplayPhase.PLAYER_INPUT) { throw Rune.invalidAction() }
  console.log("Deploy Check 2")
  // does the player have enough resources?
  if (player.resources <= 0) { throw Rune.invalidAction() }
  console.log("Deploy Check 3")
  // did the player already issue an attack command?
  if (player.ready) { throw Rune.invalidAction() }
  console.log("Deploy Check 4")
  // return the active player
  return player;
}


function deployMinion(game: GameState, player: PlayerState, minion: MinionType): void {
  // place the minion on the battlefield
  spawnMinion(game, player, minion);
  // spend the player's resources
  player.resources--;
}


function spawnMinion(game: GameState, player: PlayerState, minion: MinionType): void {
  // place the minion on the battlefield
  const army: ArmyState = getPlayerArmy(player, minion);
  army.minions++;
  // register the minion and the event
  console.log("Minion Spawned:", minion)
  // emitMinionSpawned(game.events, minion, where);
}


// -----------------------------------------------------------------------------
// Game Logic - Attacking
// -----------------------------------------------------------------------------


function validateAttackCommand(
  game: GameState,
  playerId: string
): PlayerState {
  console.log("Validate Attack")
  const playerIndex: PlayerIndex = getPlayerIndex(game, playerId);
  // can the player issue attack commands?
  if (playerIndex === PlayerIndex.NONE) { throw Rune.invalidAction() }
  console.log("Attack Check 1")
  const player: PlayerState = game.players[playerIndex];
  console.log("Current player:", player.id)
  console.log("Action player:", playerId)
  console.log("Game Phase:", game.phase)
  // is the game accepting attack commands?
  if (game.phase != GameplayPhase.PLAYER_INPUT) { throw Rune.invalidAction() }
  console.log("Attack Check 2")
  // did the player already issue an attack command?
  if (player.ready) { throw Rune.invalidAction() }
  console.log("Attack Check 3")
  // return the active player
  return player;
}


// -----------------------------------------------------------------------------
// Game Logic - Upgrades
// -----------------------------------------------------------------------------


function validateUpgradeCommand(
  game: GameState,
  playerId: string,
  minion: MinionType
): PlayerState {
  console.log("Validate Upgrade")
  const playerIndex: PlayerIndex = getPlayerIndex(game, playerId);
  // can the player issue deploy commands?
  if (playerIndex ===PlayerIndex.NONE) { throw Rune.invalidAction() }
  console.log("Upgrade Check 1")
  const player: PlayerState = game.players[playerIndex];
  console.log("Current player:", player.id)
  console.log("Action player:", playerId)
  console.log("Game Phase:", game.phase)
  console.log("Minion Type:", minion)
  console.log("Player Resources:", player.resources)
  // is the game accepting upgrade commands?
  if (game.phase != GameplayPhase.PLAYER_INPUT) { throw Rune.invalidAction() }
  console.log("Upgrade Check 2")
  // does the player have enough resources?
  if (player.resources < COST_UPGRADE) { throw Rune.invalidAction() }
  console.log("Upgrade Check 3")
  // can this type of minion be upgraded?
  const army: ArmyState = getPlayerArmy(player, minion);
  if (army.tier >= MAX_TIER) { throw Rune.invalidAction() }
  console.log("Upgrade Check 4")
  // did the player already issue an attack command?
  if (player.ready) { throw Rune.invalidAction() }
  console.log("Upgrade Check 4")
  // return the active player
  return player;
}


function upgradeMinions(
  game: GameState,
  player: PlayerState,
  minion: MinionType
): void {
  const army: ArmyState = getPlayerArmy(player, minion);
  army.tier++;
}


// -----------------------------------------------------------------------------
// Game Logic - Combat
// -----------------------------------------------------------------------------


function enterCombatPhase(game: GameState): void {
  game.phase = GameplayPhase.COMBAT_STEP;
  const attacker: PlayerState = game.players[0];
  const defender: PlayerState = game.players[1];
  const attackTypes: MinionType[] = formationToMinionTypeStack(attacker.formation);
  const defenseTypes: MinionType[] = formationToMinionTypeStack(defender.formation);
  const attackingArmies: ArmyState[] = getArmiesByFormation(attacker);
  const defendingArmies: ArmyState[] = getArmiesByFormation(defender);
}


function resolveCombat(
  game: GameState,
  attacker: PlayerState,
  attackFormation: Formation,
  defender: PlayerState,
  defenseFormation: Formation
): number {
  const attackTypes: MinionType[] = formationToMinionTypeStack(attackFormation);
  const defenseTypes: MinionType[] = formationToMinionTypeStack(defenseFormation);

  const attackingMinions: number[] = [];
  for (const minion of attackTypes) {
    attackingMinions.push(minionsByType(attacker, minion));
  }

  const defendingMinions: number[] = [];
  for (const minion of defenseTypes) {
    defendingMinions.push(minionsByType(defender, minion));
  }

  let attackType: MinionType = attackTypes.pop() as MinionType;
  let defenseType: MinionType = defenseTypes.pop() as MinionType;
  let numAttackers: number = minionsByType(attacker, attackType);
  let numDefenders: number = minionsByType(defender, defenseType);

  while (attackTypes.length > 0 && defenseTypes.length > 0) {
    // are there any attackers of this type?
    if (numAttackers <= 0) {
      attackType = attackTypes.pop() as MinionType;
      numAttackers = minionsByType(attacker, attackType);
      continue;
    }
    // are there any defenders of this type?
    if (numDefenders <= 0) {
      defenseType = defenseTypes.pop() as MinionType;
      numDefenders = minionsByType(defender, defenseType);
      continue;
    }
    // calculate the type matchup bonuses
    const bonusAttackType = typeMatchupMultiplier(attackType, defenseType);
    const bonusDefenseType = typeMatchupMultiplier(defenseType, attackType);
    // calculate total damage output
    const totalAttack = numAttackers * bonusAttackType;
    const totalDefense = numDefenders * bonusDefenseType;
    // update the remaining survivors
    numAttackers -= totalDefense;
    numDefenders -= totalAttack;
    // outcome of this round
    let result = CombatResult.DRAW;
    if (numAttackers <= 0 && numDefenders > 0) {
      result = CombatResult.LOSS;
    } else if (numAttackers > 0 && numDefenders <= 0) {
      result = CombatResult.WIN;
    }
    // TODO emit combat step
  }

  // general outcome
  let result = CombatResult.DRAW;
  if (numAttackers <= 0 && numDefenders > 0) {
    result = CombatResult.LOSS;
  } else if (numAttackers > 0 && numDefenders <= 0) {
    result = CombatResult.WIN;
  }
  return result;
}


function resolveCombatStep(
  game: GameState,
  attacker: PlayerState,
  attackType: MinionType,
  defender: PlayerState,
  defenseType: MinionType
): PlayerIndex {
  // get each player's armies of the given minion type
  const attackingArmy = getPlayerArmy(attacker, attackType);
  const defendingArmy = getPlayerArmy(defender, defenseType);
  // calculate the type matchup bonuses
  const attackBonus = typeMatchupMultiplier(attackType, defenseType);
  const defenseBonus = typeMatchupMultiplier(defenseType, attackType);
  // calculate how strong is each side's minions
  const attackingMinionValue = attackingArmy.tier * attackBonus;
  const defendingMinionValue = defendingArmy.tier * defenseBonus;
  // calculate the total damage from each side
  const totalAttack = attackingArmy.minions * attackingMinionValue;
  const totalDefense = defendingArmy.minions * defendingMinionValue;
  // calculate how many minions die on each side
  const attackerCasualties = (totalDefense / attackingMinionValue) | 0;
  const defenderCasualties = (totalAttack / defendingMinionValue) | 0;
  // register casualties and calculate score
  let score = 0;
  if (attackerCasualties >= attackingArmy.minions) {
    // attackingArmy.minions = 0;
    // defender.victoryPoints++;
    score++;
  }
  if (defenderCasualties >= defendingArmy.minions) {
    // defendingArmy.minions = 0;
    // attacker.victoryPoints++;
    score--;
  }
  if (score > 0) { return attacker.index }
  if (score < 0) { return defender.index }
  return PlayerIndex.NONE;
}


function formationToMinionTypes(formation: Formation): MinionType[] {
  switch (formation) {
    case Formation.POWER_TECHNICAL_SPEED:
      return [MinionType.POWER, MinionType.TECHNICAL, MinionType.SPEED];
    case Formation.SPEED_POWER_TECHNICAL:
      return [MinionType.SPEED, MinionType.POWER, MinionType.TECHNICAL];
    case Formation.SPEED_TECHNICAL_POWER:
      return [MinionType.SPEED, MinionType.TECHNICAL, MinionType.POWER];
    case Formation.TECHNICAL_POWER_SPEED:
      return [MinionType.TECHNICAL, MinionType.POWER, MinionType.SPEED];
    case Formation.TECHNICAL_SPEED_POWER:
      return [MinionType.TECHNICAL, MinionType.SPEED, MinionType.POWER];
  }
  return [MinionType.POWER, MinionType.SPEED, MinionType.TECHNICAL];
}


// same as above, but in reverse order
function formationToMinionTypeStack(formation: Formation): MinionType[] {
  switch (formation) {
    case Formation.POWER_TECHNICAL_SPEED:
      return [MinionType.SPEED, MinionType.TECHNICAL, MinionType.POWER];
    case Formation.SPEED_POWER_TECHNICAL:
      return [MinionType.TECHNICAL, MinionType.POWER, MinionType.SPEED];
    case Formation.SPEED_TECHNICAL_POWER:
      return [MinionType.POWER, MinionType.TECHNICAL, MinionType.SPEED];
    case Formation.TECHNICAL_POWER_SPEED:
      return [MinionType.SPEED, MinionType.POWER, MinionType.TECHNICAL];
    case Formation.TECHNICAL_SPEED_POWER:
      return [MinionType.POWER, MinionType.SPEED, MinionType.TECHNICAL];
  }
  return [MinionType.TECHNICAL, MinionType.SPEED, MinionType.POWER];
}


function typeMatchupMultiplier(attacker: MinionType, defender: MinionType): number {
  if (attacker === MinionType.POWER && defender === MinionType.TECHNICAL) { return 2 }
  if (attacker === MinionType.SPEED && defender === MinionType.POWER) { return 2 }
  if (attacker === MinionType.TECHNICAL && defender === MinionType.SPEED) { return 2 }
  return 1;
}


// -----------------------------------------------------------------------------
// Game Logic - Miscellaneous
// -----------------------------------------------------------------------------


function validateReadyCommand(
  game: GameState,
  playerId: string
): PlayerState {
  console.log("Validate Ready")
  const playerIndex: PlayerIndex = getPlayerIndex(game, playerId);
  // can the player answer to ready checks?
  if (playerIndex === PlayerIndex.NONE) { throw Rune.invalidAction() }
  console.log("Ready Check 1")
  const player: PlayerState = game.players[playerIndex];
  console.log("Current player:", player.id)
  console.log("Action player:", playerId)
  console.log("Game Phase:", game.phase)
  // is the game accepting ready checks?
  if (game.phase != GameplayPhase.PLAYER_INPUT) { throw Rune.invalidAction() }
  console.log("Ready Check 2")
  // did the player already answer the ready check?
  if (player.ready) { throw Rune.invalidAction() }
  console.log("Ready Check 3")
  // return the active player
  return player;
}


function tryStateTransition(game: GameState): void {
  for (const player of game.players) {
    if (!player.ready) { return }
  }
  for (const player of game.players) {
    player.ready = false;
  }
  switch (game.phase) {
    case GameplayPhase.PLAYER_INPUT:
      game.phase = GameplayPhase.COMBAT_STEP;
      break;
  }
}


// -----------------------------------------------------------------------------
// Game Actions
// -----------------------------------------------------------------------------

type DeployActionPayload = {
  minion: MinionType;
};


type UpgradeActionPayload = {
  minion: MinionType;
};


type AttackActionPayload = {
  formation: Formation;
};


type ReadyActionPayload = {};


type GameActions = {
  deploy: (params: DeployActionPayload) => void;
  upgrade: (params: UpgradeActionPayload) => void;
  attack: (params: AttackActionPayload) => void;
  ready: (params: ReadyActionPayload) => void;
};


// -----------------------------------------------------------------------------
// Rune Setup
// -----------------------------------------------------------------------------


declare global {
  const Rune: RuneClient<GameState, GameActions>
}


Rune.initLogic({
  minPlayers: 1,
  maxPlayers: 2,

  setup(allPlayerIds): GameState {
    const players: PlayerState[] = [newPlayerState(allPlayerIds[0], PlayerIndex.PLAYER1)];
    if (allPlayerIds.length > 1) {
      players.push(newPlayerState(allPlayerIds[1], PlayerIndex.PLAYER2));
    } else {
      players.push(newPlayerState("AI", PlayerIndex.PLAYER2))
    }
    const game: GameState = {
      phase: GameplayPhase.PLAYER_INPUT,
      turnsTaken: 0,
      timer: TIME_PER_TURN,
      players,
    };
    return game;
  },

  update: ({ game }) => {
    if (game.timer <= 0) {
      // resolveCombatPhase(game);
      game.timer = TIME_PER_TURN;
    } else {
      --game.timer;
    }
  },

  actions: {
    deploy({ minion }, { game, playerId }) {
      // validate inputs
      const player: PlayerState = validateDeployCommand(game, playerId, minion);
      // empty the event queue
      game.events = [];
      // execute the command
      deployMinion(game, player, minion);
      // transition to the next player, ask for new input
      // swapTurns(game);
      console.log("FIXME - swapTurn() here")
    },

    upgrade({ minion }, { game, playerId }) {
      // validate inputs
      const player: PlayerState = validateUpgradeCommand(game, playerId, minion);
      // empty the event queue
      game.events = [];
      // execute the command
      upgradeMinions(game, player, minion);
      // transition to the next player, ask for new input
      // swapTurns(game);
      console.log("FIXME - swapTurn() here")
    },

    attack({ formation }, { game, playerId }) {
      const player: PlayerState = validateAttackCommand(game, playerId);
      // empty the event queue
      game.events = [];
      // execute the command
      player.formation = formation;
      player.ready = true;
      // transition to the next player, ask for new input
      // swapTurns(game);
      console.log("FIXME - swapTurn() here")
    },

    ready(_, { game, playerId }) {
      const player: PlayerState = validateReadyCommand(game, playerId);
      // empty the event queue
      game.events = [];
      // execute the command
      player.ready = true;
      // transition to the next player, ask for new input
      // swapTurns(game);
      console.log("FIXME - swapTurn() here")
    },
  },

  events: {
    playerJoined() {
      // Handle player joined
    },

    playerLeft() {
      // Handle player left
    },
  },
})
