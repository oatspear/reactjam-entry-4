import 'animate.css';
import "./App.css"
import { useEffect, useState } from "react"
import { GameState, GameplayPhase, PlayerIndex, PlayerState, getPlayerIndex } from "./logic.ts"
import PlayerStatusBar from "./components/PlayerStatusBar.tsx";
import Battlefield from "./components/BattlefieldView.tsx";
import PlayerActionBar from "./components/PlayerActionBar.tsx";
import MatchupHelper from "./components/MatchupHelper.tsx";

import iconBot from "./assets/avatar-bot.png";
import iconSwordL from "./assets/sword-l.png";
import iconSwordR from "./assets/sword-r.png";
import iconHorn from "./assets/horn.png";


type PlayersObject = Record<string, { playerId: string, displayName: string, avatarUrl: string }>;

interface ClientPlayerInfo {
  playerId: string;
  displayName: string;
  avatarUrl: string;
  index: PlayerIndex;
  resources: number;
}

enum UIState {
  INITIAL = 0,
  ANIMATING,
  INPUT_MAIN,
  TRANSITION_TO_COMBAT,
}


function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
}


function getTopBottomPlayers(
  game: GameState,
  playerIndex: PlayerIndex,
  players: PlayersObject
): ClientPlayerInfo[] {
  const clientPlayers = [];
  for (const state of game.players) {
    clientPlayers.push({ ...players[state.id], index: state.index, resources: state.resources });
  }
  if (playerIndex === PlayerIndex.PLAYER1) {
    return clientPlayers.reverse();
  }
  return clientPlayers;
}


function App() {
  // game state
  const [game, setGame] = useState<GameState | undefined>();
  const [myPlayerId, setMyPlayerId] = useState<string | undefined>();
  const [players, setPlayers] = useState<PlayersObject>({});
  // layer visibility
  const [uiState, setUiState] = useState<UIState>(UIState.INITIAL);

  useEffect(() => {
    Rune.initClient({
      onChange: ({ newGame, oldGame, yourPlayerId, players }) => {
        setGame(newGame);
        setMyPlayerId(yourPlayerId);
        setPlayers({
          ...players,
          AI: {
            playerId: "AI",
            displayName: "AI (Bot)",
            avatarUrl: iconBot,
          },
        });
        switch (newGame.phase) {
          case GameplayPhase.PLAYER_INPUT:
            if (oldGame.phase != GameplayPhase.PLAYER_INPUT) {
              setUiState(UIState.INPUT_MAIN);
            }
            break;
          case GameplayPhase.COMBAT:
            if (oldGame.phase != GameplayPhase.COMBAT) {
              setUiState(UIState.TRANSITION_TO_COMBAT);
            }
            break;
        }
      },
    })
  }, []);  

  if (!game) {
    return <div>Loading...</div>
  }

  // const { height, width } = getWindowDimensions();

  const playerIndex: PlayerIndex = getPlayerIndex(game, myPlayerId);
  const [clientEnemy, clientPlayer] = getTopBottomPlayers(game, playerIndex, players);

  const playerState: PlayerState = game.players[clientPlayer.index];
  const enemyState: PlayerState = game.players[clientEnemy.index];

  const spectator: boolean = myPlayerId == null;
  const showActionBar: boolean = !spectator && uiState === UIState.INPUT_MAIN && !playerState.ready;
  // const tempEnemyDisplayName: string = `width: ${width} ~ height: ${height}`;
  const showCombatAnimation: boolean = uiState === UIState.TRANSITION_TO_COMBAT;
  const showIntroAnimation: boolean = game.phase === GameplayPhase.INITIAL;

  return (
    <>
      <MatchupHelper />
      <main>
        <PlayerStatusBar player={enemyState} displayName={clientEnemy.displayName} avatarUrl={clientEnemy.avatarUrl} />
        <Battlefield game={game} playerIndex={clientPlayer.index} enemyIndex={clientEnemy.index} showIntro={showIntroAnimation} />
        <PlayerStatusBar player={playerState} displayName={clientPlayer.displayName} avatarUrl={clientPlayer.avatarUrl} />
      </main>
      <section className="main-action-container">
        { showActionBar && <PlayerActionBar player={playerState} /> }
        {
          showCombatAnimation &&
          <div className="combat-animnation">
            <img className="animate__animated animate__backInRight" src={iconSwordL} alt="Sword" />
            <img className="animate__animated animate__backInLeft" src={iconSwordR} alt="Sword" />
          </div>
        }
        {
          showIntroAnimation &&
          <div className="combat-animnation">
            <img className="animate__animated animate__delay-1s animate__repeat-3 animate__tada" src={iconHorn} alt="Horn" />
          </div>
        }
      </section>
    </>
  )
}

export default App;
