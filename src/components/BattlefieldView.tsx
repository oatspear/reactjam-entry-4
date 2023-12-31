import 'animate.css';
import './BattlefieldView.css';
import { ArmyState, GameState, GameplayPhase, MinionType, PlayerIndex, PlayerState, calculateCombatScore, formationToMinionTypes, getArmiesByFormation, minionTypesToFormation } from '../logic.ts';
import Army from './Army.tsx';
import { useState } from 'react';
import ScoreMeter from './ScoreMeter.tsx';

import iconDefeat from "../assets/defeat.png";
import iconVictory from "../assets/victory.png";


// Define the type for component props
interface BattlefieldProps {
  game: GameState;
  playerIndex: PlayerIndex;
  enemyIndex: PlayerIndex;
  showIntro: boolean;
}


const Battlefield = ({ game, playerIndex, enemyIndex, showIntro }: BattlefieldProps): JSX.Element => {
  const isInputPhase: boolean = game.phase === GameplayPhase.PLAYER_INPUT;
  const isCombatPhase: boolean = game.phase === GameplayPhase.COMBAT || game.phase === GameplayPhase.FINAL;
  const player: PlayerState = game.players[playerIndex];
  const enemy: PlayerState = game.players[enemyIndex];
  // score is in [-3, 3], positive iff the player is winning
  const score: number = player.victoryPoints - enemy.victoryPoints;

  const [selectedArmy, setSelectedArmy] = useState<number>(-1);

  function handleSelectArmy(i: number) {
    if (!isInputPhase) {
      setSelectedArmy(-1);
      return;
    }
    if (selectedArmy < 0) {
      setSelectedArmy(i);
    } else {
      if (selectedArmy != i) {
        const currentOrder: MinionType[] = formationToMinionTypes(player.nextFormation);
        const newOrder: MinionType[] = currentOrder.slice();
        newOrder[i] = currentOrder[selectedArmy];
        newOrder[selectedArmy] = currentOrder[i];
        Rune.actions.formation({ formation: minionTypesToFormation(newOrder) });
      }
      setSelectedArmy(-1);
    }
  }

  function handleAttack() {
    setSelectedArmy(-1);
    if (!player.ready) {
      Rune.actions.ready(true);
    }
  }

  const enemyArmies: ArmyState[] = getArmiesByFormation(enemy, enemy.formation);
  const playerArmies: ArmyState[] = getArmiesByFormation(player, player.nextFormation);

  const combatResult: number = game.lastCombat.result;
  const displayScore: number = game.lastCombat.attacker === playerIndex ? combatResult : -combatResult;

  return (
    <div className="battlefield">
      <ScoreMeter score={score} />

      <div className="arena">
        <div className="column">
          <Army
            index={0}
            army={enemyArmies[0]}
            flip={true}
            isActive={false}
            isHighlighted={false}
            multiplier={isCombatPhase && (enemyArmies[0].combatMultiplier > 1)}
          />
          <div className="army-score">
            {
              isCombatPhase &&
              <div className="icon animate__animated animate__bounceIn animate__delay-2s">
                { calculateCombatScore(playerArmies[0], enemyArmies[0]) }
              </div>
            }
          </div>
          <Army
            index={0}
            army={playerArmies[0]}
            flip={false}
            onClick={handleSelectArmy}
            isActive={selectedArmy === 0}
            isHighlighted={selectedArmy >= 0}
            showHelper={showIntro}
            multiplier={isCombatPhase && (playerArmies[0].combatMultiplier > 1)}
          />
        </div>

        <div className="column">
          <Army
            index={1}
            army={enemyArmies[1]}
            flip={true}
            isActive={false}
            isHighlighted={false}
            multiplier={isCombatPhase && (enemyArmies[1].combatMultiplier > 1)}
          />
          <div className="army-score">
            {
              isCombatPhase &&
              <div className="icon animate__animated animate__bounceIn animate__delay-3s">
                { calculateCombatScore(playerArmies[1], enemyArmies[1]) }
              </div>
            }
            {
              isInputPhase &&
              <button className="action" disabled={player.ready} onClick={handleAttack}>
                Go! ({game.timer})
              </button>
            }
          </div>
          <Army
            index={1}
            army={playerArmies[1]}
            flip={false}
            onClick={handleSelectArmy}
            isActive={selectedArmy === 1}
            isHighlighted={selectedArmy >= 0}
            showHelper={showIntro}
            multiplier={isCombatPhase && (playerArmies[1].combatMultiplier > 1)}
          />
        </div>

        <div className="column">
          <Army
            index={2}
            army={enemyArmies[2]}
            flip={true}
            isActive={false}
            isHighlighted={false}
            multiplier={isCombatPhase && (enemyArmies[2].combatMultiplier > 1)}
          />
          <div className="army-score">
            {
              isCombatPhase &&
              <div className="icon animate__animated animate__bounceIn animate__delay-4s">
                { calculateCombatScore(playerArmies[2], enemyArmies[2]) }
              </div>
            }
          </div>
          <Army
            index={2}
            army={playerArmies[2]}
            flip={false}
            onClick={handleSelectArmy}
            isActive={selectedArmy === 2}
            isHighlighted={selectedArmy >= 0}
            showHelper={showIntro}
            multiplier={isCombatPhase && (playerArmies[2].combatMultiplier > 1)}
          />
        </div>
      </div>

      <div className="indicators">
        <div className="icon-wrapper-32 icon-64">
          {
            isCombatPhase &&
            <img
              className="animate__animated animate__bounceIn animate__delay-5s"
              src={displayScore < 0 ? iconVictory : iconDefeat }
              alt="Result"
            />
          }
        </div>
        <div className="army-score">
          {
            isCombatPhase &&
            <div className="icon animate__animated animate__bounceIn animate__delay-5s">
              { displayScore }
            </div>
          }
        </div>
        <div className="icon-wrapper-32 icon-64">
          {
            isCombatPhase &&
            <img
              className="animate__animated animate__bounceIn animate__delay-5s"
              src={displayScore > 0 ? iconVictory : iconDefeat }
              alt="Result"
            />
          }
        </div>
      </div>
    </div>
  );
};

export default Battlefield;
