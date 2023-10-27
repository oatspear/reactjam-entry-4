import './PlayerActionBar.css';
import { ArmyState, COST_UPGRADE, MinionType, PlayerState, canDeploy, canUpgrade, getPlayerArmy } from '../logic';
import { useCallback, useState } from 'react';

import iconPower from "../assets/power.png";
import iconSpeed from "../assets/speed.png";
import iconTechnical from "../assets/technical.png";
import iconDeploy from "../assets/deploy-white.png";
import iconUpgrade2 from "../assets/upgrade2-bw.png";
import iconUpgrade3 from "../assets/upgrade3-bw.png";
import iconResource from "../assets/resource.png";


// Define the type for component props
interface PlayerActionBarProps {
  player: PlayerState;
}


const PlayerActionBar = ({ player }: PlayerActionBarProps): JSX.Element => {
  const [selectedArmyType, setSelectedArmyType] = useState<MinionType>(MinionType.POWER);

  const selectPowerArmy = useCallback(() => {
    setSelectedArmyType(MinionType.POWER)
  }, []);

  const selectSpeedArmy = useCallback(() => {
    setSelectedArmyType(MinionType.SPEED)
  }, []);

  const selectTechnicalArmy = useCallback(() => {
    setSelectedArmyType(MinionType.TECHNICAL)
  }, []);

  function handleDeploy() {
    if (canDeploy(player)) {
      Rune.actions.deploy({ minion: selectedArmyType });
    }
  }

  function handleUpgrade() {
    if (canUpgrade(player, selectedArmyType)) {
      Rune.actions.upgrade({ minion: selectedArmyType });
    }
  }

  const army: ArmyState = getPlayerArmy(player, selectedArmyType);
  const disableDeploy: boolean = !canDeploy(player);
  const disableUpgrade: boolean = !canUpgrade(player, selectedArmyType);

  return (
    <>
      <div className="switch-controls">
        <input
          className="hidden radio-label"
          type="radio"
          name="deck-menu"
          id="button-minion-power"
          onChange={selectPowerArmy}
          checked={selectedArmyType === MinionType.POWER}
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
          checked={selectedArmyType === MinionType.SPEED}
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
          checked={selectedArmyType === MinionType.TECHNICAL}
        />
        <label className="button-label" htmlFor="button-minion-technical">
          <img src={iconTechnical} alt="Army 3" />
        </label>
      </div>


      <div className="main-action-bar">
        <div className="action">
          <button disabled={disableDeploy} onClick={handleDeploy}>
            <img src={iconDeploy} alt="Deploy" />
          </button>
          <span className={disableDeploy ? "cost disabled" : "cost"}>
            1
            <img src={iconResource} alt="Resources" />
          </span>
        </div>
        <div className="action">
          <button disabled={disableUpgrade} onClick={handleUpgrade}>
            {
              (army.tier + army.upgrades) < 2
              ? <img src={iconUpgrade2} alt="Upgrade" />
              : <img src={iconUpgrade3} alt="Upgrade" />
            }
          </button>
          <span className={disableUpgrade ? "cost disabled" : "cost"}>
            {COST_UPGRADE}
            <img src={iconResource} alt="Resources" />
          </span>
        </div>
      </div>
    </>
  );
};

export default PlayerActionBar;
