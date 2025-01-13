import { useCallback, useState } from "react";
import "./App.css";

type GameSize = {
  name: string;
  size: number;
  hardModePool?: number;
};

const GAME_SIZES: GameSize[] = [
  { name: "5x5 (25)", size: 5, hardModePool: 50 },
  { name: "8x8 (64)", size: 8, hardModePool: 100 },
  { name: "10x10 (100)", size: 10, hardModePool: 128 },
];

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

function createInitialArray(
  size: number,
  isHardMode: boolean
): [number, boolean][] {
  const gameSize = GAME_SIZES.find((g) => g.size === size);
  if (!gameSize) return [];

  const maxNumber =
    isHardMode && gameSize.hardModePool ? gameSize.hardModePool : size * size;

  // Create array of all possible numbers
  const allNumbers = Array.from({ length: maxNumber }, (_, i) => i + 1);

  // If in hard mode, randomly select the required amount of numbers
  const selectedNumbers =
    isHardMode && gameSize.hardModePool
      ? shuffle(allNumbers).slice(0, size * size)
      : allNumbers.slice(0, size * size);

  // Sort the numbers to ensure they're in ascending order
  selectedNumbers.sort((a, b) => a - b);

  // Shuffle the sorted numbers and pair with false for not selected
  return shuffle(
    selectedNumbers.map((num) => [num, false] as [number, boolean])
  );
}

type GameControlsProps = {
  size: number;
  isBlindMode: boolean;
  isHardMode: boolean;
  onSizeChange: (size: number) => void;
  onBlindModeChange: (isBlind: boolean) => void;
  onHardModeChange: (isHard: boolean) => void;
};

function GameControls({
  size,
  isBlindMode,
  isHardMode,
  onSizeChange,
  onBlindModeChange,
  onHardModeChange,
}: GameControlsProps) {
  const getGridLabel = (gameSize: GameSize) => {
    const n = gameSize.size * gameSize.size;
    if (isHardMode) {
      return `${gameSize.size}×${gameSize.size} (${n} of ${gameSize.hardModePool})`;
    }
    return `${gameSize.size}×${gameSize.size} (${n})`;
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        alignItems: "center",
        padding: "16px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div>
        <label
          htmlFor="size-select"
          style={{ marginRight: "10px", fontWeight: "500", color: "#213547" }}
        >
          Grid Size:
        </label>
        <select
          id="size-select"
          value={size}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          style={{
            width: "140px",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid rgba(0, 0, 0, 0.2)",
            fontSize: "16px",
            background: "rgba(255, 255, 255, 0.8)",
            color: "#213547",
            cursor: "pointer",
            outline: "none",
          }}
        >
          {GAME_SIZES.map((gameSize) => (
            <option key={gameSize.size} value={gameSize.size}>
              {getGridLabel(gameSize)}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <label
          htmlFor="blind-mode"
          style={{
            marginRight: "10px",
            fontWeight: "500",
            color: "#213547",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          Blind Mode:
        </label>
        <input
          id="blind-mode"
          type="checkbox"
          checked={isBlindMode}
          onChange={(e) => onBlindModeChange(e.target.checked)}
          style={{
            width: "18px",
            height: "18px",
            cursor: "pointer",
            accentColor: "#646cff",
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <label
          htmlFor="hard-mode"
          style={{
            marginRight: "10px",
            fontWeight: "500",
            color: "#213547",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          Hard Mode:
        </label>
        <input
          id="hard-mode"
          type="checkbox"
          checked={isHardMode}
          onChange={(e) => onHardModeChange(e.target.checked)}
          style={{
            width: "18px",
            height: "18px",
            cursor: "pointer",
            accentColor: "#646cff",
          }}
        />
      </div>
    </div>
  );
}

type GameStatusProps = {
  isComplete: boolean;
  isGameOver: boolean;
  isBoardHidden: boolean;
  isHardMode: boolean;
  getTimeString: () => string;
  onReset: () => void;
  onStartGame: () => void;
};

// Common button style to be used in both places
const buttonStyle = {
  marginTop: "8px",
  padding: "8px 16px",
  fontSize: "16px",
  borderRadius: "4px",
  background: "#646cff",
  color: "white",
  border: "none",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
};

function GameStatus({
  isComplete,
  isGameOver,
  isBoardHidden,
  getTimeString,
  onReset,
  onStartGame,
  isHardMode,
}: GameStatusProps) {
  return (
    <div
      style={{
        minHeight: "160px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "16px",
        background: "rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        width: "100%",
        maxWidth: "500px",
        color: "#213547",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {isComplete ? (
        <>
          <h1 style={{ margin: 0 }}>Congratulations!</h1>
          <p>You've completed the game!</p>
          <p>{getTimeString()}</p>
          <button onClick={onReset} style={buttonStyle}>
            Play Again
          </button>
        </>
      ) : isGameOver ? (
        <>
          <h1 style={{ margin: 0 }}>Game Over!</h1>
          <p>You clicked the wrong number!</p>
          <p>{getTimeString()}</p>
          <button onClick={onReset} style={buttonStyle}>
            Try Again
          </button>
        </>
      ) : isBoardHidden ? (
        <>
          <p style={{ margin: 0, fontSize: "18px" }}>
            Find and click numbers in ascending order
          </p>
          <p style={{ margin: "8px 0", fontSize: "16px" }}>
            {isHardMode
              ? "Numbers are randomly selected from a larger pool!"
              : "Start with 1 and count up!"}
          </p>
          <button onClick={onStartGame} style={buttonStyle}>
            Start Game
          </button>
        </>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: "18px" }}>
            Find and click numbers in ascending order
          </p>
          <p style={{ margin: "8px 0", fontSize: "16px" }}>
            {isHardMode
              ? "Numbers are randomly selected from a larger pool!"
              : "Start with 1 and count up!"}
          </p>
        </>
      )}
    </div>
  );
}

type GameBoardProps = {
  numbers: [number, boolean][];
  isBoardHidden: boolean;
  isGameOver: boolean;
  wrongSquareIndex: number | null;
  correctNumber: number | null;
  onNumberClick: (index: number) => void;
};

function GameBoard({
  numbers,
  isBoardHidden,
  isGameOver,
  wrongSquareIndex,
  correctNumber,
  onNumberClick,
}: GameBoardProps) {
  const generateRows = () => {
    const rows = [];
    const actualSize = Math.round(Math.sqrt(numbers.length));
    if (!actualSize || numbers.length !== actualSize * actualSize) return [];

    // Update viewport width calculation
    const padding = 32; // Page padding (16px * 2)
    const spacing = 8; // Total spacing between cells (4px * 2)
    const maxWidth = 500; // Maximum width of the game board
    const viewportWidth = Math.min(window.innerWidth - padding, maxWidth);
    const totalSpacing = spacing * (actualSize - 1);
    const cellSize = Math.floor((viewportWidth - totalSpacing) / actualSize);

    for (let y = 0; y < actualSize; y++) {
      const row = [];
      for (let x = 0; x < actualSize; x++) {
        const i = y * actualSize + x;
        const [number, isSelected] = numbers[i];
        row.push(
          <td
            key={i}
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              fontSize: cellSize < 40 ? "14px" : "16px",
              backgroundColor:
                i === wrongSquareIndex
                  ? "#ffcdd2"
                  : number === correctNumber
                  ? "#90caf9"
                  : isSelected
                  ? "#90EE90"
                  : "#f5f5f5",
              cursor: isGameOver
                ? "default"
                : isSelected
                ? "default"
                : "pointer",
              borderRadius: "4px",
              margin: "4px",
              textAlign: "center",
              fontWeight: "500",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
              transition: "background-color 0.2s ease",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
              userSelect: "none",
            }}
            onClick={() => {
              if (isGameOver) return;
              onNumberClick(i);
            }}
          >
            {!isBoardHidden && number}
          </td>
        );
      }
      rows.push(
        <tr key={y} style={{ padding: "2px" }}>
          {row}
        </tr>
      );
    }
    return rows;
  };

  return (
    <div
      style={{
        overflowX: "auto",
        maxWidth: "100%",
        padding: "0 8px", // Add some padding
        boxSizing: "border-box", // Ensure padding is included in width
      }}
    >
      <table
        style={{
          borderCollapse: "separate",
          borderSpacing: "4px",
          margin: "0 auto", // Center the table
        }}
      >
        <tbody>{generateRows()}</tbody>
      </table>
    </div>
  );
}

function App() {
  const [size, setSize] = useState<number>(8);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [isHardMode, setIsHardMode] = useState(false);
  const [isBoardHidden, setIsBoardHidden] = useState(false);
  const [numbers, setNumbers] = useState<[number, boolean][]>(() =>
    createInitialArray(size, false)
  );
  const [nextNumber, setNextNumber] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wrongSquareIndex, setWrongSquareIndex] = useState<number | null>(null);
  const [correctNumber, setCorrectNumber] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const resetGame = useCallback(
    (newSize?: number, shouldHideBoard?: boolean) => {
      setIsComplete(false);
      setIsGameOver(false);
      setStartTime(null);
      setEndTime(null);
      setWrongSquareIndex(null);
      setCorrectNumber(null);
      setNumbers(createInitialArray(newSize ?? size, isHardMode));
      setIsBoardHidden(shouldHideBoard ?? isBlindMode);
    },
    [size, isBlindMode, isHardMode]
  );

  const handleNumberClick = useCallback(
    (index: number) => {
      const [number, _selected] = numbers[index];

      // Find the smallest unselected number
      const nextExpectedNumber = numbers.reduce(
        (smallest, [num, isSelected]) => {
          if (!isSelected && (smallest === null || num < smallest)) {
            return num;
          }
          return smallest;
        },
        null as number | null
      );

      if (startTime === null && !isBlindMode) {
        setStartTime(Date.now());
      }

      if (number !== nextExpectedNumber) {
        setIsGameOver(true);
        setEndTime(Date.now());
        setWrongSquareIndex(index);
        setCorrectNumber(nextExpectedNumber);
        return;
      }

      const newNumbers = numbers.map(([num, isSelected], i) => [
        num,
        i === index ? true : isSelected,
      ]);
      setNumbers(newNumbers as [number, boolean][]);

      // Check if this was the last number
      const remainingUnselected = newNumbers.some(
        ([_num, isSelected]) => !isSelected
      );
      if (!remainingUnselected) {
        setIsComplete(true);
        setEndTime(Date.now());
      }
    },
    [numbers, startTime, isBlindMode]
  );

  const getTimeString = () => {
    if (!startTime || !endTime) return "";
    const totalSeconds = Math.floor((endTime - startTime) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes === 0) {
      return `Time: ${seconds} seconds`;
    }
    return `Time: ${minutes} minute${
      minutes !== 1 ? "s" : ""
    } ${seconds} second${seconds !== 1 ? "s" : ""}`;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "1rem",
          background: "linear-gradient(45deg, #646cff, #9089fc)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          textShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        Number Memory Game
      </h1>
      <GameControls
        size={size}
        isBlindMode={isBlindMode}
        isHardMode={isHardMode}
        onSizeChange={(newSize) => {
          setSize(newSize);
          resetGame(newSize);
        }}
        onBlindModeChange={(newBlindMode) => {
          setIsBlindMode(newBlindMode);
          resetGame(undefined, newBlindMode);
        }}
        onHardModeChange={(newHardMode) => {
          setIsHardMode(newHardMode);
          setNumbers(createInitialArray(size, newHardMode));
          setIsComplete(false);
          setIsGameOver(false);
          setStartTime(null);
          setEndTime(null);
          setWrongSquareIndex(null);
          setCorrectNumber(null);
        }}
      />
      <GameStatus
        isComplete={isComplete}
        isGameOver={isGameOver}
        isBoardHidden={isBoardHidden}
        isHardMode={isHardMode}
        getTimeString={getTimeString}
        onReset={() => resetGame()}
        onStartGame={() => {
          setIsBoardHidden(false);
          setStartTime(Date.now());
        }}
      />
      <GameBoard
        numbers={numbers}
        isBoardHidden={isBoardHidden}
        isGameOver={isGameOver}
        wrongSquareIndex={wrongSquareIndex}
        correctNumber={correctNumber}
        onNumberClick={handleNumberClick}
      />
    </div>
  );
}

export default App;
