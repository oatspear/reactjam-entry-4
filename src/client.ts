/******************************************************************************/
/* Imports */
/******************************************************************************/

import { ArmyState, MinionType, PlayerIndex, PlayerState, formationToMinionTypes } from "./logic";


/******************************************************************************/
/* Data Types */
/******************************************************************************/

export interface ClientPlayer {
  playerId: string;
  displayName: string;
  avatarUrl: string;
  index: PlayerIndex;
  resources: number;
  formation: MinionType[];
  power: ArmyState;
  speed: ArmyState;
  technical: ArmyState;
  victoryPoints: number;
  ready: boolean;
  human: boolean;
}


export function newClientPlayer(state: PlayerState, displayName: string, avatarUrl: string) {
  return {
    playerId: state.id,
    displayName,
    avatarUrl,
    index: state.index,
    resources: state.resources,
    formation: formationToMinionTypes(state.formation),
    
  }
}
