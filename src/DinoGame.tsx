import { useState, useEffect, useRef, useCallback } from "react";

export function DinoGame() {
  const [gameStarted, setGameStarted] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [obstacles, setObstacles] = useState<{ id: number; x: number }[]>([]);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const dinoYRef = useRef(0);
  const velocityRef = useRef(0);
  const nextObstacleIdRef = useRef(0);
  const lastObstacleTimeRef = useRef(0);

  const DINO_WIDTH = 28;
  const DINO_HEIGHT = 30;
  const GROUND_Y = 20; // Distance from bottom of canvas
  const JUMP_STRENGTH = -10;
  const GRAVITY = 0.6;
  const OBSTACLE_SPEED = 5;
  const OBSTACLE_WIDTH = 20;
  const OBSTACLE_HEIGHT = 35;
  const DINO_X = 40;

  const jump = () => {
    if (!isJumping && !gameOver && dinoYRef.current === 0) {
      setIsJumping(true);
      velocityRef.current = JUMP_STRENGTH;
    }
  };

  const resetGame = useCallback(() => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setObstacles([]);
    setIsJumping(false);
    dinoYRef.current = 0;
    velocityRef.current = 0;
    nextObstacleIdRef.current = 0;
    lastObstacleTimeRef.current = 0;
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!gameStarted) {
          setGameStarted(true);
        } else if (gameOver) {
          resetGame();
        } else {
          if (!isJumping && dinoYRef.current === 0) {
            setIsJumping(true);
            velocityRef.current = JUMP_STRENGTH;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, gameOver, isJumping, resetGame, JUMP_STRENGTH]);

  useEffect(() => {
    if (!gameStarted || gameOver) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const gameLoop = () => {
      const now = Date.now();

      // Update dino physics
      if (isJumping || dinoYRef.current > 0) {
        velocityRef.current += GRAVITY;
        dinoYRef.current += velocityRef.current;

        if (dinoYRef.current >= 0) {
          dinoYRef.current = 0;
          velocityRef.current = 0;
          setIsJumping(false);
        }
      }

      // Spawn obstacles
      if (now - lastObstacleTimeRef.current > 2000) {
        const newObstacle = {
          id: nextObstacleIdRef.current++,
          x: 600,
        };
        setObstacles((prev) => [...prev, newObstacle]);
        lastObstacleTimeRef.current = now;
      }

      // Update obstacles
      setObstacles((prev) => {
        const updated = prev
          .map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED }))
          .filter((obs) => obs.x > -OBSTACLE_WIDTH);

        // Check collision (with slight tolerance for better gameplay)
        const dinoBottom = GROUND_Y - dinoYRef.current;
        const dinoTop = dinoBottom + DINO_HEIGHT;
        const dinoLeft = DINO_X + 5; // Small margin for better feel
        const dinoRight = DINO_X + DINO_WIDTH - 5; // Small margin

        const obsBottom = GROUND_Y;
        const obsTop = GROUND_Y + OBSTACLE_HEIGHT;

        for (const obs of updated) {
          const obsLeft = obs.x + 5; // Emoji cacti have transparent edges
          const obsRight = obs.x + 19; // Approximate visible width

          // AABB collision detection
          if (
            dinoRight > obsLeft &&
            dinoLeft < obsRight &&
            dinoBottom < obsTop &&
            dinoTop > obsBottom
          ) {
            setGameOver(true);
          }
        }

        return updated;
      });

      // Update score
      setScore((prev) => prev + 1);

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, isJumping]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // backgroundColor: "#f7f7f7",
        fontFamily: "monospace",
        padding: "2rem",
        borderRadius: "8px",
        gap: "1rem",
      }}
    >
      <div
        onClick={() => {
          if (!gameStarted) {
            setGameStarted(true);
          } else if (gameOver) {
            resetGame();
          } else {
            jump();
          }
        }}
        style={{
          position: "relative",
          width: "600px",
          height: "120px",
          overflow: "hidden",
          cursor: "pointer",
          backgroundColor: "#ffffff",
          border: "1px solid #e0e0e0",
        }}
      >
        {/* Score - Top Right */}
        <div
          style={{
            position: "absolute",
            top: "8px",
            right: "12px",
            fontSize: "12px",
            color: "#535353",
            letterSpacing: "1px",
          }}
        >
          {String(Math.floor(score / 10)).padStart(5, "0")}
        </div>

        {/* Ground Line */}
        <div
          style={{
            position: "absolute",
            bottom: `${GROUND_Y}px`,
            left: "0",
            right: "0",
            height: "1px",
            backgroundColor: "#535353",
          }}
        />

        {/* Dino - Facing Right */}
        <div
          style={{
            position: "absolute",
            left: `${DINO_X}px`,
            bottom: `${GROUND_Y - dinoYRef.current - 5}px`,
            width: `${DINO_WIDTH}px`,
            height: `${DINO_HEIGHT}px`,
            fontSize: "24px",
            lineHeight: "24px",
            transform: "scaleX(-1)",
            userSelect: "none",
          }}
        >
          🦖
        </div>

        {/* Obstacles - Simple Cacti */}
        {obstacles.map((obs) => (
          <div
            key={obs.id}
            style={{
              position: "absolute",
              left: `${obs.x}px`,
              bottom: `${GROUND_Y}px`,
              fontSize: "24px",
              lineHeight: "24px",
              userSelect: "none",
            }}
          >
            🌵
          </div>
        ))}

        {/* Start Screen Overlay */}
        {!gameStarted && (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                marginBottom: "6px",
                color: "#535353",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            >
              DINO GAME
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#888",
              }}
            >
              Press SPACE or Click to start
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameOver && (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                marginBottom: "6px",
                color: "#535353",
                fontWeight: "bold",
                letterSpacing: "2px",
              }}
            >
              GAME OVER
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#888",
              }}
            >
              Press SPACE or Click to restart
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          marginTop: "10px",
          fontSize: "12px",
          color: "#999",
        }}
      >
        Press SPACE or ↑ to jump
      </div>
    </div>
  );
}
