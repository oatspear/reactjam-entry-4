import { ArmyState, MinionType } from '../logic';
import './Army.css';

import iconPower from "../assets/power.png";
import iconSpeed from "../assets/speed-blue.png";
import iconTechnical from "../assets/technical-green.png";

// Define the type for component props
interface ArmyProps {
  army: ArmyState;
  flip: boolean;
}


const Army = ({ army, flip }: ArmyProps): JSX.Element => {
  const icon: string = army.type === MinionType.POWER
    ? iconPower
    : army.type === MinionType.SPEED
    ? iconSpeed
    : iconTechnical;

  return (
    <div className="army">
      { flip && <span>stats</span> }

      <div className="sprite">
        <img src={icon} alt="sprite" />
      </div>

      { !flip && <span>stats</span> }
    </div>
  );
};

export default Army;
