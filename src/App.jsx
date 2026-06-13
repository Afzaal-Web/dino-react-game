import { useEffect, useState } from "react";
import "./App.css";

const obstacles = ["🌵", "🪨", "🐦"];

const selectedCharacter = {
  name: "Dino",
  image: "/characters/dino 2.png",
};

function App() {
  const [isStarted, setIsStarted] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacleLeft, setObstacleLeft] = useState(850);
  const [obstacle, setObstacle] = useState("🌵");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("dinoHighScore")) || 0,
  );
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lives, setLives] = useState(3);
  const [showLifeMessage, setShowLifeMessage] = useState(false);

  const speed = 10 + Math.floor(score / 5) * 2;
  const isNight = score >= 10;

  const playSound = (soundName) => {
    const audio = new Audio(`/sounds/${soundName}.wav`);
    audio.volume = 0.5;
    audio.play();
  };

  const jump = () => {
    if (!isStarted || gameOver || isPaused || isJumping) return;

    playSound("jump");

    setIsJumping(true);

    setTimeout(() => {
      setIsJumping(false);
    }, 600);
  };

  const startGame = () => {
    setIsStarted(true);
  };

  const restartGame = () => {
    setIsStarted(true);
    setObstacleLeft(850);
    setObstacle("🌵");
    setScore(0);
    setGameOver(false);
    setIsJumping(false);
    setIsPaused(false);
    setLives(3);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        if (gameOver) {
          restartGame();
        } else if (!isStarted) {
          startGame();
        } else {
          jump();
        }
      }

      if (e.key.toLowerCase() === "p" && isStarted && !gameOver) {
        setIsPaused((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isStarted, gameOver, isPaused, isJumping]);

  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return;

    const obstacleMove = setInterval(() => {
      setObstacleLeft((prev) => {
        if (prev <= -60) {
          setScore((prevScore) => {
            const newScore = prevScore + 1;

            if (newScore % 10 === 0) {
              setLives((prevLives) => Math.min(prevLives + 1, 6));

              setShowLifeMessage(true);

              setTimeout(() => {
                setShowLifeMessage(false);
              }, 2000);

              playSound("score");
            }

            return newScore;
          });

          const randomObstacle =
            obstacles[Math.floor(Math.random() * obstacles.length)];

          setObstacle(randomObstacle);
          return 850;
        }

        return prev - speed;
      });
    }, 50);

    return () => clearInterval(obstacleMove);
  }, [isStarted, gameOver, isPaused, speed]);

  useEffect(() => {
    if (!isStarted || gameOver || isPaused) return;

    const playerBottom = isJumping ? 180 : 58;

    const isCollision =
      obstacleLeft > 70 && obstacleLeft < 165 && playerBottom < 100;

    if (isCollision) {
      setObstacleLeft(850);

      setLives((prevLives) => {
        if (prevLives <= 1) {
          playSound("game-over");
          setGameOver(true);

          if (score > highScore) {
            localStorage.setItem("dinoHighScore", score);
            setHighScore(score);
          }

          return 0;
        }

        playSound("hit");
        return prevLives - 1;
      });
    }
  }, [
    obstacleLeft,
    isJumping,
    isStarted,
    gameOver,
    isPaused,
    score,
    highScore,
  ]);

  return (
    <div className={`game-container ${isNight ? "night" : ""}`}>
      <h1>🦖 Dino Runner</h1>

      <p className="tagline">
        Unlike Chrome Dino, this one works even when your internet does.
      </p>

      <div className="top-bar">
        <span>Score: {score}</span>
        <span>High Score: {highScore}</span>
        <span>Lives: {"❤️".repeat(lives)}</span>
      </div>

      <div className="game-box" onClick={jump}>
        <div className="sun-moon">{isNight ? "🌙" : "☀️"}</div>

        <div className="cloud cloud-one">☁️</div>
        <div className="cloud cloud-two">☁️</div>

        <div className={`player dino-player ${isJumping ? "jump" : ""}`}>
          <img src={selectedCharacter.image} alt={selectedCharacter.name} />
        </div>

        {isStarted && !gameOver && (
          <div className="obstacle" style={{ left: `${obstacleLeft}px` }}>
            {obstacle}
          </div>
        )}

        <div className="ground"></div>
        {showLifeMessage && <div className="life-message">❤️ +1 Life!</div>}

        {!isStarted && (
          <div className="overlay">
            <img
              src={selectedCharacter.image}
              alt="Dino"
              className="start-dino"
            />

            <h2>Dino Runner</h2>
            <p>Press Space or Click Start</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
              }}
            >
              Start Game
            </button>
          </div>
        )}

        {isPaused && (
          <div className="overlay">
            <h2>Paused</h2>
            <p>Press P to Resume</p>
          </div>
        )}

        {gameOver && (
          <div className="overlay">
            <h2>Game Over</h2>

            <p>Your Score: {score}</p>

            <p>Press Space to Restart the game</p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                restartGame();
              }}
            >
              Restart
            </button>
          </div>
        )}
      </div>

      <p className="controls">Space / Click = Jump | P = Pause</p>
    </div>
  );
}

export default App;
