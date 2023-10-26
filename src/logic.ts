// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------

import type { Players, RuneClient } from "rune-games-sdk/multiplayer"

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------


const TIME_FOR_INTRO: number = 10;  // seconds
const TIME_PER_TURN: number = 45;  // seconds
const TIME_PER_COMBAT: number = 10;  // seconds

const VICTORY_POINT_DIFF: number = 3;
const RESOURCES_PER_TURN: number = 2;
export const MAX_TIER: number = 3;
export const COST_UPGRADE: number = 3;

export enum GameplayPhase {
  INITIAL,
  PLAYER_INPUT,
  COMBAT,
}

export enum MinionType {
  POWER = 1,
  SPEED = 2,
  TECHNICAL = 3,
}


export function typeMatchupMultiplier(attacker: MinionType, defender: MinionType): number {
  if (attacker === MinionType.POWER && defender === MinionType.TECHNICAL) { return 2 }
  if (attacker === MinionType.SPEED && defender === MinionType.POWER) { return 2 }
  if (attacker === MinionType.TECHNICAL && defender === MinionType.SPEED) { return 2 }
  return 1;
}


export enum Formation {
  POWER_SPEED_TECHNICAL = 1,
  POWER_TECHNICAL_SPEED,
  SPEED_POWER_TECHNICAL,
  SPEED_TECHNICAL_POWER,
  TECHNICAL_POWER_SPEED,
  TECHNICAL_SPEED_POWER,
}


function getRandomFormation(): Formation {
  const r: number = Math.random() * 6;
  if (r < 1) { return Formation.POWER_SPEED_TECHNICAL }
  if (r < 2) { return Formation.POWER_TECHNICAL_SPEED }
  if (r < 3) { return Formation.SPEED_POWER_TECHNICAL }
  if (r < 4) { return Formation.SPEED_TECHNICAL_POWER }
  if (r < 5) { return Formation.TECHNICAL_POWER_SPEED }
  return Formation.TECHNICAL_SPEED_POWER;
}


export function formationToMinionTypes(formation: Formation): MinionType[] {
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
export function formationToMinionTypeStack(formation: Formation): MinionType[] {
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


export function minionTypesToFormation(types: MinionType[]): Formation {
  if (types.length != 3) { throw new Error(`bad minion type array: ${types}`) }
  switch (types[0]) {
    case MinionType.POWER:
      if (types[1] === MinionType.SPEED) { return Formation.POWER_SPEED_TECHNICAL }
      return Formation.POWER_TECHNICAL_SPEED;
    case MinionType.SPEED:
      if (types[1] === MinionType.POWER) { return Formation.SPEED_POWER_TECHNICAL }
      return Formation.SPEED_TECHNICAL_POWER;
    case MinionType.TECHNICAL:
      if (types[1] === MinionType.POWER) { return Formation.TECHNICAL_POWER_SPEED }
      return Formation.TECHNICAL_SPEED_POWER;
  }
  return Formation.POWER_SPEED_TECHNICAL;
}


export enum PlayerIndex {
  NONE = -1,
  PLAYER1 = 0,
  PLAYER2 = 1,
  PLAYER3 = 2,
  PLAYER4 = 3,
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
  combatValue: number;
  combatMultiplier: number;
  production: number;
  upgrades: number;
}


function newArmyState(type: MinionType): ArmyState {
  return {
    type,
    minions: 1,
    tier: 1,
    combatMultiplier: 0,
    combatValue: 0,
    production: 0,
    upgrades: 0,
  }
}


function applyCombatCommands(army: ArmyState): void {
  army.minions += army.production;
  army.production = 0;
  army.tier += army.upgrades;
  army.upgrades = 0;
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
  human: boolean;
  thisTurnDeployed: boolean;
  thisTurnUpgraded: boolean;
  nextFormation: Formation;
}


function newPlayerState(id: string, index: PlayerIndex): PlayerState {
  return {
    id,
    index,
    resources: 0,
    formation: Formation.POWER_SPEED_TECHNICAL,
    power: newArmyState(MinionType.POWER),
    speed: newArmyState(MinionType.SPEED),
    technical: newArmyState(MinionType.TECHNICAL),
    victoryPoints: 0,
    ready: false,
    human: true,
    thisTurnDeployed: false,
    thisTurnUpgraded: false,
    nextFormation: Formation.POWER_SPEED_TECHNICAL,
  };
}


function newAIPlayerState(index: PlayerIndex): PlayerState {
  const player: PlayerState = newPlayerState("AI", index);
  player.human = false;
  return player;
}


function setupPlayersFromIds(allPlayerIds: string[]): PlayerState[] {
  const players: PlayerState[] = [newPlayerState(allPlayerIds[0], PlayerIndex.PLAYER1)];
  if (allPlayerIds.length < 2) {
    // Player 2 is an AI
    players.push(newAIPlayerState(PlayerIndex.PLAYER2));
  } else {
    // Player 2 is Human
    players.push(newPlayerState(allPlayerIds[1], PlayerIndex.PLAYER2));
  }
  if (allPlayerIds.length >= 3) {
    // 4-Player game, 3rd Player is Human
    players.push(newPlayerState(allPlayerIds[2], PlayerIndex.PLAYER3));
    if (allPlayerIds.length === 3) {
      // Player 4 is an AI
      players.push(newAIPlayerState(PlayerIndex.PLAYER4));
    } else {
      // Player 4 is Human
      players.push(newPlayerState(allPlayerIds[3], PlayerIndex.PLAYER4));
    }
  }
  return players;
}


export function getPlayerArmy(player: PlayerState, type: MinionType): ArmyState {
  switch (type) {
    case MinionType.POWER:
      return player.power;
    case MinionType.SPEED:
      return player.speed;
    case MinionType.TECHNICAL:
      return player.technical;
  }
}


export function getArmiesByFormation(player: PlayerState, formation: Formation): ArmyState[] {
  switch (formation) {
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
// Game State
// -----------------------------------------------------------------------------


export interface GameState {
  phase: GameplayPhase;
  timer: number;
  turnsTaken: number;
  nextTimestamp: number;
  players: PlayerState[];
  lastCombat?: CombatState;
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
  // run action-specific checks
  if (!canDeploy(player)) { throw Rune.invalidAction() }
  // return the active player
  return player;
}


export function canDeploy(player: PlayerState): boolean {
  // did the player already issue a ready command?
  if (player.ready) { return false }
  console.log("Deploy Check 3")
  // does the player have enough resources?
  if (player.resources <= 0) { return false }
  console.log("Deploy Check 4")
  return true;
}


function deployMinion(game: GameState, player: PlayerState, minion: MinionType): void {
  // place the minion on the battlefield
  enqueueMinion(game, player, minion);
  // spend the player's resources
  player.resources--;
  // update player flags
  player.thisTurnDeployed = true;
}


function enqueueMinion(game: GameState, player: PlayerState, minion: MinionType): void {
  // place the minion on the battlefield
  const army: ArmyState = getPlayerArmy(player, minion);
  army.production++;
  // register the minion and the event
  console.log("Minion Spawned:", minion)
  // emitMinionSpawned(game.events, minion, where);
}


// -----------------------------------------------------------------------------
// Game Logic - Formations
// -----------------------------------------------------------------------------


function validateFormationCommand(
  game: GameState,
  playerId: string
): PlayerState {
  console.log("Validate Formation")
  const playerIndex: PlayerIndex = getPlayerIndex(game, playerId);
  // can the player issue formation commands?
  if (playerIndex === PlayerIndex.NONE) { throw Rune.invalidAction() }
  console.log("Formation Check 1")
  const player: PlayerState = game.players[playerIndex];
  console.log("Current player:", player.id)
  console.log("Action player:", playerId)
  console.log("Game Phase:", game.phase)
  // is the game accepting formation commands?
  if (game.phase != GameplayPhase.PLAYER_INPUT) { throw Rune.invalidAction() }
  console.log("Formation Check 2")
  // did the player already issue a ready command?
  if (player.ready) { throw Rune.invalidAction() }
  console.log("Formation Check 3")
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
  if (playerIndex === PlayerIndex.NONE) { throw Rune.invalidAction() }
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
  // run action-specific checks
  if (!canUpgrade(player, minion)) { throw Rune.invalidAction() }
  // return the active player
  return player;
}


export function canUpgrade(player: PlayerState, minion: MinionType): boolean {
  // did the player already issue a ready command?
  if (player.ready) { return false }
  console.log("Upgrade Check 3")
  // does the player have enough resources?
  if (player.resources < COST_UPGRADE) { return false }
  console.log("Upgrade Check 4")
  // can this type of minion be upgraded?
  const army: ArmyState = getPlayerArmy(player, minion);
  if ((army.tier + army.upgrades) >= MAX_TIER) { return false }
  console.log("Upgrade Check 5")
  return true;
}


function upgradeMinions(
  game: GameState,
  player: PlayerState,
  minion: MinionType
): void {
  const army: ArmyState = getPlayerArmy(player, minion);
  // army.tier++;
  army.upgrades++;
  // spend the player's resources
  player.resources -= COST_UPGRADE;
  // update player flags
  player.thisTurnUpgraded = true;
}


// -----------------------------------------------------------------------------
// Game Logic - Combat
// -----------------------------------------------------------------------------


export interface CombatState {
  attacker: PlayerIndex;
  defender: PlayerIndex;
  result: number;
}


function resolveCombat(attacker: PlayerState, defender: PlayerState): CombatState {
  const attackTypes: MinionType[] = formationToMinionTypeStack(attacker.formation);
  const defenseTypes: MinionType[] = formationToMinionTypeStack(defender.formation);

  let result = 0;
  while (attackTypes.length > 0 && defenseTypes.length > 0) {
    // get the matchup
    const attackType: MinionType = attackTypes.pop() as MinionType;
    const defenseType: MinionType = defenseTypes.pop() as MinionType;
    // update the score
    result += resolveCombatStep(attacker, attackType, defender, defenseType);
  }

  // cleanup leftovers
  while (attackTypes.length > 0) {
    // get the (empty) matchup
    const attackType: MinionType = attackTypes.pop() as MinionType;
    const army = getPlayerArmy(attacker, attackType);
    army.combatMultiplier = 1;
    const value = army.minions * army.tier;
    army.combatValue = value;
    // update the score
    result += value;
  }
  while (defenseTypes.length > 0) {
    // get the (empty) matchup
    const defenseType: MinionType = defenseTypes.pop() as MinionType;
    const army = getPlayerArmy(defender, defenseType);
    army.combatMultiplier = 1;
    const value = army.minions * army.tier;
    army.combatValue = value;
    // update the score
    result += value;
  }

  return {
    attacker: attacker.index,
    defender: defender.index,
    result,
  };
}


function resolveCombatStep(
  attacker: PlayerState,
  attackType: MinionType,
  defender: PlayerState,
  defenseType: MinionType
): number {
  // get each player's armies of the given minion type
  const attackingArmy = getPlayerArmy(attacker, attackType);
  const defendingArmy = getPlayerArmy(defender, defenseType);
  // calculate the type matchup bonuses
  const attackMultiplier = typeMatchupMultiplier(attackType, defenseType);
  const defenseMultiplier = typeMatchupMultiplier(defenseType, attackType);
  attackingArmy.combatMultiplier = attackMultiplier;
  defendingArmy.combatMultiplier = defenseMultiplier;
  // calculate how strong is each side's minions
  const attackingMinionValue = attackingArmy.tier * attackMultiplier;
  const defendingMinionValue = defendingArmy.tier * defenseMultiplier;
  // calculate the total damage from each side
  const totalAttack = attackingArmy.minions * attackingMinionValue;
  const totalDefense = defendingArmy.minions * defendingMinionValue;
  attackingArmy.combatValue = totalAttack;
  defendingArmy.combatValue = totalDefense;
  // return the combat step result
  return totalAttack - totalDefense;
}


// no side effects here
function calculateCombatScore(attackingArmy: ArmyState, defendingArmy: ArmyState): number {
  // calculate the type matchup bonuses
  const attackMultiplier = typeMatchupMultiplier(attackingArmy.type, defendingArmy.type);
  const defenseMultiplier = typeMatchupMultiplier(defendingArmy.type, attackingArmy.type);
  // calculate how strong is each side's minions
  const attackingMinionValue = attackingArmy.tier * attackMultiplier;
  const defendingMinionValue = defendingArmy.tier * defenseMultiplier;
  // calculate the total damage from each side
  const totalAttack = attackingArmy.minions * attackingMinionValue;
  const totalDefense = defendingArmy.minions * defendingMinionValue;
  // return the combat score
  return totalAttack - totalDefense;
}


/*
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
*/


function resetCombatVariables(army: ArmyState): void {
  army.combatMultiplier = 1;
  army.combatValue = army.minions * army.tier;
  army.production = 0;
  army.upgrades = 0;
}


// -----------------------------------------------------------------------------
// Game Logic - AI
// -----------------------------------------------------------------------------


function runAIPlayers(game: GameState): void {
  for (const player of game.players) {
    if (!player.human && !player.ready) {
      aiDecideNextAction(game, player);
    }
  }
}


function aiDecideNextAction(game: GameState, ai: PlayerState): void {
  // AI does not care about animations
  if (game.phase !== GameplayPhase.PLAYER_INPUT) {
    return setAIReady(ai);
  }

  // nothing to do if there are no more resources left
  if (ai.resources <= 0) {
    return setAIReady(ai);
  }

  // run logic for the next best action
  const player: PlayerState = game.players[PlayerIndex.PLAYER1];
  const threat: ArmyState = getMostThreateningArmy(player);
  const army: ArmyState = getBestArmyAgainst(ai, threat);

  // upgrade the selected army if possible
  if (canUpgrade(ai, army.type)) {
    return upgradeMinions(game, ai, army.type);
  }

  // are there any upgrades to get?
  if (canGetUpgrades(ai)) {
    // 35% chance of doing nothing if not fully upgraded (save resources)
    if (Math.random() < 0.35) {
      return setAIReady(ai);
    }
  }

  // deploy minion on the selected army
  if (canDeploy(ai)) {
    // deploy to the selected army if it is the first minion
    if (!ai.thisTurnDeployed) {
      return deployMinion(game, ai, army.type);
    }

    // deploy to any army otherwise
    const r: number = Math.random() * 3;
    if (r < 1) {
      return deployMinion(game, ai, MinionType.POWER);
    } else if (r < 2) {
      return deployMinion(game, ai, MinionType.SPEED);
    } else {
      return deployMinion(game, ai, MinionType.TECHNICAL);
    }
  }

  // if unable to deploy for some reason, just skip the turn
  setAIReady(ai);
}


function getMostThreateningArmy(player: PlayerState): ArmyState {
  let threat: ArmyState = player.power;
  let n: number = threat.minions * threat.tier;
  let candidate: ArmyState = player.speed;
  let x: number = candidate.minions * candidate.tier;
  if (x > n) {
    n = x;
    threat = candidate;
  }
  candidate = player.technical;
  x = candidate.minions * candidate.tier;
  if (x > n) {
    n = x;
    threat = candidate;
  }
  return threat;
}


function getBestArmyAgainst(player: PlayerState, threat: ArmyState): ArmyState {
  let strongArmy: ArmyState = player.power;
  let equalArmy: ArmyState = player.power;
  let weakArmy: ArmyState = player.power;
  switch (threat.type) {
    case MinionType.POWER:
      strongArmy = player.speed;
      equalArmy = player.power;
      weakArmy = player.technical;
      break;
    case MinionType.SPEED:
      strongArmy = player.technical;
      equalArmy = player.speed;
      weakArmy = player.power;
      break;
    case MinionType.TECHNICAL:
      strongArmy = player.power;
      equalArmy = player.technical;
      weakArmy = player.speed;
      break;
  }
  const strongValue = calculateCombatScore(strongArmy, threat);
  const equalValue = calculateCombatScore(equalArmy, threat);
  const weakValue = calculateCombatScore(weakArmy, threat);
  if (weakValue > equalValue && weakValue > strongValue) { return weakArmy }
  if (equalValue > strongValue && equalValue >= weakValue) { return equalArmy }
  return strongArmy;
}


function canGetUpgrades(player: PlayerState): boolean {
  if ((player.power.tier + player.power.upgrades) < MAX_TIER) { return true }
  if ((player.speed.tier + player.speed.upgrades) < MAX_TIER) { return true }
  if ((player.technical.tier + player.technical.upgrades) < MAX_TIER) { return true }
  return false;
}


function setAIReady(ai: PlayerState): void {
  ai.ready = true;
  ai.nextFormation = getRandomFormation();
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


function checkGameOver(game: GameState): void {
  const attacker: PlayerState = game.players[0];
  const defender: PlayerState = game.players[1];
  const diff: number = attacker.victoryPoints - defender.victoryPoints;
  if (diff > VICTORY_POINT_DIFF) {
    Rune.gameOver({
      players: {
        [attacker.id]: "WON",  // attacker.victoryPoints
        [defender.id]: "LOST",  // defender.victoryPoints
      },
      // delayPopUp: true,
    })
  } else if (-diff > VICTORY_POINT_DIFF) {
    Rune.gameOver({
      players: {
        [defender.id]: "WON",  // defender.victoryPoints
        [attacker.id]: "LOST",  // attacker.victoryPoints
      },
      // delayPopUp: true,
    })
  }
}


function tryStateTransition(game: GameState): boolean {
  for (const player of game.players) {
    if (!player.ready) { return false }
  }
  enterNextState(game);
  return true;
}


function enterNextState(game: GameState): void {
  for (const player of game.players) {
    player.ready = false;
  }
  switch (game.phase) {
    case GameplayPhase.PLAYER_INPUT:
      return enterCombatPhase(game);
    case GameplayPhase.COMBAT:
      checkGameOver(game);
      return enterPlayerInputPhase(game);
  }
  return enterPlayerInputPhase(game);
}


function enterPlayerInputPhase(game: GameState): void {
  game.phase = GameplayPhase.PLAYER_INPUT;
  game.turnsTaken++;
  game.nextTimestamp = Rune.gameTimeInSeconds() + TIME_PER_TURN;
  game.timer = TIME_PER_TURN;
  // attribute start of turn resources to all players
  // clear temporary combat data from all players
  // reset player flags
  for (const player of game.players) {
    player.resources += RESOURCES_PER_TURN;
    player.thisTurnDeployed = false;
    player.thisTurnUpgraded = false;
    player.nextFormation = player.formation;
    resetCombatVariables(player.power);
    resetCombatVariables(player.speed);
    resetCombatVariables(player.technical);
  }
}


function enterCombatPhase(game: GameState): void {
  game.phase = GameplayPhase.COMBAT;
  game.nextTimestamp = Rune.gameTimeInSeconds() + TIME_PER_COMBAT;
  game.timer = TIME_PER_COMBAT;

  // put the queued commands in effect
  const attacker: PlayerState = game.players[0];
  attacker.formation = attacker.nextFormation;
  applyCombatCommands(attacker.power);
  applyCombatCommands(attacker.speed);
  applyCombatCommands(attacker.technical);

  const defender: PlayerState = game.players[1];
  defender.formation = defender.nextFormation;
  applyCombatCommands(defender.power);
  applyCombatCommands(defender.speed);
  applyCombatCommands(defender.technical);

  game.lastCombat = resolveCombat(attacker, defender);
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


type FormationActionPayload = {
  formation: Formation;
};


type ReadyActionPayload = null | undefined | true;


type GameActions = {
  deploy: (params: DeployActionPayload) => void;
  upgrade: (params: UpgradeActionPayload) => void;
  formation: (params: FormationActionPayload) => void;
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
    const game: GameState = {
      phase: GameplayPhase.INITIAL,
      turnsTaken: 0,
      nextTimestamp: Rune.gameTimeInSeconds() + TIME_FOR_INTRO,
      timer: TIME_PER_TURN,
      players: setupPlayersFromIds(allPlayerIds),
    };
    return game;
  },

  update: ({ game }) => {
    runAIPlayers(game);
    const t: number = Rune.gameTimeInSeconds();
    game.timer = game.nextTimestamp - t;
    if (tryStateTransition(game)) { return }
    if (game.timer < 0) {
      // force state transition
      enterNextState(game);
    }
  },

  actions: {
    deploy({ minion }, { game, playerId }) {
      // validate inputs
      const player: PlayerState = validateDeployCommand(game, playerId, minion);
      // execute the command
      deployMinion(game, player, minion);
    },

    upgrade({ minion }, { game, playerId }) {
      // validate inputs
      const player: PlayerState = validateUpgradeCommand(game, playerId, minion);
      // execute the command
      upgradeMinions(game, player, minion);
    },

    formation({ formation }, { game, playerId }) {
      const player: PlayerState = validateFormationCommand(game, playerId);
      // execute the command
      // player.formation = formation;
      player.nextFormation = formation;
      // player.ready = true;
      // transition to the next state if possible
      // tryStateTransition(game);
    },

    ready(_, { game, playerId }) {
      const player: PlayerState = validateReadyCommand(game, playerId);
      // execute the command
      player.ready = true;
      // transition to the next state if possible
      tryStateTransition(game);
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
