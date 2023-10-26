import './PlayerActionBar.css';
import { MinionType, PlayerState } from '../logic';
import { useCallback, useState } from 'react';

import iconPower from "../assets/power.png";
import iconSpeed from "../assets/speed.png";
import iconTechnical from "../assets/technical.png";


// Define the type for component props
interface PlayerActionBarProps {
  player: PlayerState;
}


const PlayerActionBar = ({ player }: PlayerActionBarProps): JSX.Element => {
  const [selectedArmy, setSelectedArmy] = useState<MinionType>(MinionType.POWER);

  const selectPowerArmy = useCallback(() => {
    setSelectedArmy(MinionType.POWER)
  }, []);

  const selectSpeedArmy = useCallback(() => {
    setSelectedArmy(MinionType.SPEED)
  }, []);

  const selectTechnicalArmy = useCallback(() => {
    setSelectedArmy(MinionType.TECHNICAL)
  }, []);

  return (
    <>
      <div className="switch-controls">
        <input
          className="hidden radio-label"
          type="radio"
          name="deck-menu"
          id="button-minion-power"
          onChange={selectPowerArmy}
          checked={selectedArmy === MinionType.POWER}
        />
        <label className="button-label" htmlFor="button-minion-power">
          <img src={iconPower} alt="Army 1" />
        </label>

        <input
          className="hidden radio-label"
          type="radio"
          name="deck-menu"
          id="button-minion-speed"
          onChange={selectSpeedArmy}
          checked={selectedArmy === MinionType.SPEED}
        />
        <label className="button-label" htmlFor="button-minion-speed">
          <img src={iconSpeed} alt="Army 2" />
        </label>

        <input
          className="hidden radio-label"
          type="radio"
          name="deck-menu"
          id="button-minion-technical"
          onChange={selectTechnicalArmy}
          checked={selectedArmy === MinionType.TECHNICAL}
        />
        <label className="button-label" htmlFor="button-minion-technical">
          <img src={iconTechnical} alt="Army 3" />
        </label>
      </div>


      <div className="main-action-bar">
        <div className="action">
          <button>D</button>
          <span>1G</span>
        </div>
        <div className="action">
          <button>U</button>
          <span>3G</span>
        </div>
      </div>
    </>
  );
};

export default PlayerActionBar;
