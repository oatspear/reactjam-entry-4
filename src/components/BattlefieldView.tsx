import './BattlefieldView.css';
import { GameState, GameplayPhase, PlayerIndex, PlayerState } from '../logic.ts';
import Army from './Army.tsx';


export interface BattlefieldCallbacks {
  
}


// Define the type for component props
interface BattlefieldProps {
  game: GameState;
  playerIndex: PlayerIndex;
  enemyIndex: PlayerIndex;
}


// ♦ ▲ ▼
const Battlefield = ({ game, playerIndex, enemyIndex }: BattlefieldProps): JSX.Element => {
  const isInputPhase: boolean = game.phase === GameplayPhase.PLAYER_INPUT;
  const isCombatPhase: boolean = game.phase === GameplayPhase.COMBAT;
  const player: PlayerState = game.players[playerIndex];
  const enemy: PlayerState = game.players[enemyIndex];

  // score is in [-3, 3], shift it by +3 to get [0, 6], i.e., a marker index.
  const score: number = enemy.victoryPoints - player.victoryPoints + 3;

  function handleAttack() {
    if (!player.ready) {
      Rune.actions.attack({ formation: player.formation });
    }
  }

  return (
    <div className="battlefield">
      <div className="score-meter">
        <span className="marker">♦</span>
        <span className="marker">♦</span>
        <span className="marker">♦</span>
        <span className="marker">♦</span>
        <span className="marker">♦</span>
        <span className="marker">♦</span>
        <span className="marker">♦</span>
      </div>

      <div className="arena">
        <div className="column">
          <Army army={enemy.power} flip={true} />
          <div className="army-score">
            { isCombatPhase && "00" }
          </div>
          <Army army={player.power} flip={false} />
        </div>

        <div className="column">
          <Army army={enemy.speed} flip={true} />
          <div className="army-score">
            { isCombatPhase && "00" }
            {
              isInputPhase &&
              <button className="action" disabled={player.ready} onClick={handleAttack}>
                Go! ({game.timer})
              </button>
            }
          </div>
          <Army army={player.speed} flip={false} />
        </div>

        <div className="column">
          <Army army={enemy.technical} flip={true} />
          <div className="army-score">
            { isCombatPhase && "00" }
          </div>
          <Army army={player.technical} flip={false} />
        </div>
      </div>

      <div className="indicators"></div>
    </div>
  );
};

export default Battlefield;
