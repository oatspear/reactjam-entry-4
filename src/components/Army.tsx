import { ArmyState, MinionType } from '../logic';
import './Army.css';

import iconPower from "../assets/power-red.png";
import iconSpeed from "../assets/speed-blue.png";
import iconTechnical from "../assets/technical-green.png";

// Define the type for component props
interface ArmyProps {
  index: number;
  army: ArmyState;
  flip: boolean;
  onClick?: (i: number) => void;
  isActive: boolean;
  isHighlighted: boolean;
}


function noop() {}


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


const Army = ({ index, army, flip, onClick, isActive, isHighlighted }: ArmyProps): JSX.Element => {
  const icon: string = army.type === MinionType.POWER
    ? iconPower
    : army.type === MinionType.SPEED
    ? iconSpeed
    : iconTechnical;

  const armyValue: number = army.minions * army.tier;
  const futureArmyValue: number = (army.minions + army.production) * (army.tier + army.upgrades);

  let cls = "army";
  if (isActive) { cls = "army focus" }
  else if (isHighlighted) { cls = "army highlight" }

  return (
    <div className={cls} onClick={onClick == null ? noop : () => onClick(index)}>
      { flip && extrasTop(icon, armyValue) }

      <div className="round-icon icon-64">
        <img src={icon} alt="sprite" />
      </div>

      { !flip && extrasBottom(icon, futureArmyValue) }
    </div>
  );
};

export default Army;
