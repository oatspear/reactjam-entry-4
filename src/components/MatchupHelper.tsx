import iconPower from "../assets/power-red.png";
import iconSpeed from "../assets/speed-green.png";
import iconTechnical from "../assets/technical-blue.png";


const MatchupHelper = (): JSX.Element => {
  return (
    <header className="h-box align-items-center evenly-spaced">
      <div className="round-icon icon-16">
        <img src={iconPower} alt="army type" />
      </div>

      <b>&gt;</b>

      <div className="round-icon icon-16">
        <img src={iconSpeed} alt="army type" />
      </div>

      <b>&gt;</b>
      
      <div className="round-icon icon-16">
        <img src={iconTechnical} alt="army type" />
      </div>

      <b>&gt;</b>

      <div className="round-icon icon-16">
        <img src={iconPower} alt="army type" />
      </div>
    </header>
  );
};

export default MatchupHelper;
