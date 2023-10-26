import { PlayerState } from '../logic';
import LazyImage from './LazyImage';
import './PlayerStatusBar.css';

import iconPlaceholder from "../assets/avatar-placeholder.png";
import iconResource from "../assets/resource-round.png";


// Define the type for component props
interface PlayerStatusBarProps {
  player: PlayerState;
  displayName: string;
  avatarUrl: string;
}


const PlayerStatusBar = ({ player, displayName, avatarUrl }: PlayerStatusBarProps): JSX.Element => {
  return (
    <div className="player-status-bar">
      <div className="nameplate">
        <LazyImage src={avatarUrl} alt={"avatar"} placeholder={iconPlaceholder} customClass="overflowing-icon" />
        <span className="name">{ displayName }</span>
        <div className="triangle"></div>
      </div>

      <div className="stats">
        <div className="triangle"></div>
        <span className="label">{ player.resources }</span>
        <div className='overflowing-icon'>
          <img src={iconResource} />
        </div>
      </div>
    </div>
  );
};

export default PlayerStatusBar;
