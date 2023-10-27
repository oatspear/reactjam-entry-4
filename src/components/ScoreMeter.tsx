import './ScoreMeter.css';
import { VICTORY_POINT_DIFF } from '../logic';

import iconEnemy from "../assets/flag-enemy.png";
import iconPlayer from "../assets/flag-player.png";
import iconBattle from "../assets/battle.png";


// Define the type for component props
interface ScoreMeterProps {
  score: number;
}


// ♦ ▲ ▼
function scoreMarkers(score: number): JSX.Element[] {
  const markers: JSX.Element[] = [];
  for (let i = VICTORY_POINT_DIFF; i >= -VICTORY_POINT_DIFF; i--) {
    const iconSrc: string = i === score ? iconBattle : i > score ? iconEnemy : iconPlayer;
    markers.push(
      <div key={i} className="marker">
        <img src={iconSrc} alt="Score" />
      </div>
    );
  }
  return markers;
}


const ScoreMeter = ({ score }: ScoreMeterProps): JSX.Element => {
  const s: number = Math.min(Math.max(score, -VICTORY_POINT_DIFF), VICTORY_POINT_DIFF);
  const n: number = 2 * VICTORY_POINT_DIFF + 1;
  // ensure a number between [0, n)
  const i: number = s + VICTORY_POINT_DIFF;
  return (
    <div className={`score-meter score-${i}-${n}`}>
      { scoreMarkers(s) }
    </div>
  );
};

export default ScoreMeter;
