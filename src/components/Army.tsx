import './Army.css';
import { ArmyState, MinionType } from '../logic';

import iconHand from "../assets/hand-down.png";
import iconDamage from "../assets/damage.png";

import iconPower from "../assets/power-red.png";
import iconSpeed from "../assets/speed-green.png";
import iconTechnical from "../assets/technical-blue.png";

import spriteWarrior1Red from "../assets/warrior1-red.png";
import spriteWarrior1Blue from "../assets/warrior1-blue.png";
import spriteWarrior2Red from "../assets/warrior2-red.png";
import spriteWarrior2Blue from "../assets/warrior2-blue.png";
import spriteWarrior3Red from "../assets/warrior3-red.png";
import spriteWarrior3Blue from "../assets/warrior3-blue.png";

import spriteArcher1Red from "../assets/archer1-red.png";
import spriteArcher1Blue from "../assets/archer1-blue.png";
import spriteArcher2Red from "../assets/archer2-red.png";
import spriteArcher2Blue from "../assets/archer2-blue.png";
import spriteArcher3Red from "../assets/archer3-red.png";
import spriteArcher3Blue from "../assets/archer3-blue.png";

import spriteMage1Red from "../assets/mage1-red.png";
import spriteMage1Blue from "../assets/mage1-blue.png";
import spriteMage2Red from "../assets/mage2-red.png";
import spriteMage2Blue from "../assets/mage2-blue.png";
import spriteMage3Red from "../assets/mage3-red.png";
import spriteMage3Blue from "../assets/mage3-blue.png";


// Define the type for component props
interface ArmyProps {
  index: number;
  army: ArmyState;
  flip: boolean;
  onClick?: (i: number) => void;
  isActive: boolean;
  isHighlighted: boolean;
  showHelper?: boolean;
  multiplier: boolean;
}


function noop() {}


function minionSprite(type: MinionType, tier: number, enemy: boolean): string {
  switch (type) {
    case MinionType.POWER:
      if (tier < 2) { return enemy ? spriteWarrior1Red : spriteWarrior1Blue }
      if (tier < 3) { return enemy ? spriteWarrior2Red : spriteWarrior2Blue }
      return enemy ? spriteWarrior3Red : spriteWarrior3Blue;
    case MinionType.SPEED:
      if (tier < 2) { return enemy ? spriteArcher1Red : spriteArcher1Blue }
      if (tier < 3) { return enemy ? spriteArcher2Red : spriteArcher2Blue }
      return enemy ? spriteArcher3Red : spriteArcher3Blue;
    case MinionType.TECHNICAL:
      if (tier < 2) { return enemy ? spriteMage1Red : spriteMage1Blue }
      if (tier < 3) { return enemy ? spriteMage2Red : spriteMage2Blue }
      return enemy ? spriteMage3Red : spriteMage3Blue;
  }
  return enemy ? spriteWarrior3Red : spriteWarrior3Blue;
}


function extrasTop(icon: string, value: number, multiplier: boolean): JSX.Element {
  return (
    <>
      { indicators(multiplier) }
      { valueLabel(icon, value) }
    </>
  );
}


function extrasBottom(icon: string, value: number, multiplier: boolean): JSX.Element {
  return (
    <>
      { valueLabel(icon, value) }
      { indicators(multiplier) }
    </>
  );
}


function indicators(multiplier: boolean): JSX.Element {
  return (
    <div className="indicators">
      {
        multiplier &&
        <div className="item animate__animated animate__heartBeat">
          <img src={iconDamage} alt="Damage" />
          <b>x2</b>
        </div>
      }
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


const Army = ({ index, army, flip, onClick, isActive, isHighlighted, showHelper, multiplier }: ArmyProps): JSX.Element => {
  const icon: string = army.type === MinionType.POWER
    ? iconPower
    : army.type === MinionType.SPEED
    ? iconSpeed
    : iconTechnical;

  const armyValue: number = army.minions * army.tier;
  const futureArmyValue: number = (army.minions + army.production) * (army.tier + army.upgrades);
  const visibleTier: number = flip ? army.tier : (army.tier + army.upgrades);

  let cls = "army";
  if (isActive) { cls = "army focus" }
  else if (isHighlighted) { cls = "army highlight" }

  return (
    <div className={cls} onClick={onClick == null ? noop : () => onClick(index)}>
      { flip && extrasTop(icon, armyValue, multiplier) }

      <div className="sprite round-icon icon-64">
        <img src={minionSprite(army.type, visibleTier, flip)} alt="sprite" />
      </div>

      { !flip && extrasBottom(icon, futureArmyValue, multiplier) }

      { showHelper && <img className="animate__animated animate__fadeInDown animate__repeat-3" src={iconHand} alt="Pointer" /> }
    </div>
  );
};

export default Army;
