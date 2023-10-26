import { ArmyState, MinionType } from '../logic';
import './Army.css';

import iconPower from "../assets/power-red.png";
import iconSpeed from "../assets/speed-blue.png";
import iconTechnical from "../assets/technical-green.png";

// Define the type for component props
interface ArmyProps {
  army: ArmyState;
  flip: boolean;
}


function extrasTop(icon: string, value: number): JSX.Element {
  return (
    <>
      { indicators() }
      { valueLabel(icon, value) }
    </>
  );
}


function extrasBottom(icon: string, value: number): JSX.Element {
  return (
    <>
      { valueLabel(icon, value) }
      { indicators() }
    </>
  );
}


function indicators(): JSX.Element {
  return (
    <div className="indicators">

    </div>
  );
}


function valueLabel(icon: string, value: number): JSX.Element {
  // const nn: string = String(value).padStart(2, "0");
  return (
    <div className="stats">
      <div className="round-icon icon-32">
        <img src={icon} alt="army type" />
      </div>
      <span>{value}</span>
    </div>
  );
}


const Army = ({ army, flip }: ArmyProps): JSX.Element => {
  const icon: string = army.type === MinionType.POWER
    ? iconPower
    : army.type === MinionType.SPEED
    ? iconSpeed
    : iconTechnical;

  const armyValue: number = army.minions * army.tier;

  return (
    <div className="army">
      { flip && extrasTop(icon, armyValue) }

      <div className="round-icon icon-64">
        <img src={icon} alt="sprite" />
      </div>

      { !flip && extrasBottom(icon, armyValue) }
    </div>
  );
};

export default Army;
