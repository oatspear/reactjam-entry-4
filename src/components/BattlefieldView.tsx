import './BattlefieldView.css';
import { GameState, PlayerIndex, PlayerState } from '../logic.ts';


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
  const player: PlayerState = game.players[playerIndex];
  const enemy: PlayerState = game.players[enemyIndex];

  // score is in [-3, 3], shift it by +3 to get [0, 6], i.e., a marker index.
  const score: number = enemy.victoryPoints - player.victoryPoints + 3;

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
        <div className="column">1</div>
        <div className="column">2</div>
        <div className="column">3</div>
      </div>

      <div className="indicators"></div>
    </div>
  );
};

export default Battlefield;
