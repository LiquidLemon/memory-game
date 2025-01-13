import { useCallback, useState } from "react";
import "./App.css";

type GameSize = {
  name: string;
  size: number;
};

const GAME_SIZES: GameSize[] = [
  { name: "5x5 (25)", size: 5 },
  { name: "8x8 (64)", size: 8 },
  { name: "10x10 (100)", size: 10 },
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

function createInitialArray(size: number): [number, boolean][] {
  return shuffle(
    Array.from(
      { length: size * size },
      (_, i) => [i + 1, false] as [number, boolean]
    )
  );
}

function App() {
  const [size, setSize] = useState<number>(8);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [isBoardHidden, setIsBoardHidden] = useState(false);
  const [numbers, setNumbers] = useState<[number, boolean][]>(() =>
    createInitialArray(size)
  );
  const [nextNumber, setNextNumber] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wrongSquareIndex, setWrongSquareIndex] = useState<number | null>(null);

  const resetGame = useCallback(
    (newSize?: number, shouldHideBoard?: boolean) => {
      setNextNumber(1);
      setIsGameOver(false);
      setStartTime(null);
      setEndTime(null);
      setWrongSquareIndex(null);
      setNumbers(createInitialArray(newSize ?? size));
      setIsBoardHidden(shouldHideBoard ?? isBlindMode);
    },
    [size, isBlindMode]
  );

  const generateRows = () => {
    const rows = [];
    const actualSize = Math.round(Math.sqrt(numbers.length));
    if (!actualSize || numbers.length !== actualSize * actualSize) return [];

    for (let y = 0; y < actualSize; y++) {
      const row = [];
      for (let x = 0; x < actualSize; x++) {
        const i = y * actualSize + x;
        const [number, isSelected] = numbers[i];
        row.push(
          <td
            key={i}
            style={{
              width: "50px",
              height: "50px",
              backgroundColor:
                i === wrongSquareIndex
                  ? "#ffcdd2"
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
            }}
            onClick={() => {
              if (isGameOver) return;

              if (startTime === null && !isBlindMode) {
                setStartTime(Date.now());
              }

              if (number !== nextNumber) {
                setIsGameOver(true);
                setEndTime(Date.now());
                setWrongSquareIndex(i);
                return;
              }

              const newNextNumber = nextNumber + 1;
              setNumbers(
                numbers.map(([num, isSelected], index) => [
                  num,
                  index === i ? true : isSelected,
                ])
              );
              setNextNumber(newNextNumber);

              if (newNextNumber > size * size) {
                setEndTime(Date.now());
              }
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

  const getTimeString = () => {
    if (!startTime || !endTime) return "";
    const seconds = ((endTime - startTime) / 1000).toFixed(1);
    return `Time: ${seconds} seconds`;
  };

  return (
    <div
      style={{
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <div>
          <label
            htmlFor="size-select"
            style={{
              marginRight: "10px",
              fontWeight: "500",
            }}
          >
            Grid Size:
          </label>
          <select
            id="size-select"
            value={size}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setSize(newSize);
              resetGame(newSize);
            }}
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
              fontSize: "16px",
            }}
          >
            {GAME_SIZES.map((gameSize) => (
              <option key={gameSize.size} value={gameSize.size}>
                {gameSize.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="blind-mode"
            style={{
              marginRight: "10px",
              fontWeight: "500",
            }}
          >
            Blind Mode:
          </label>
          <input
            id="blind-mode"
            type="checkbox"
            checked={isBlindMode}
            onChange={(e) => {
              const newBlindMode = e.target.checked;
              setIsBlindMode(newBlindMode);
              resetGame(undefined, newBlindMode);
            }}
          />
        </div>
      </div>

      <div
        style={{
          height: "160px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {nextNumber > size * size ? (
          <>
            <h1 style={{ margin: 0 }}>Congratulations!</h1>
            <p>You've completed the game!</p>
            <p>{getTimeString()}</p>
            <button onClick={() => resetGame()}>Play Again</button>
          </>
        ) : isGameOver ? (
          <>
            <h1 style={{ margin: 0 }}>Game Over!</h1>
            <p>You clicked the wrong number!</p>
            <p>{getTimeString()}</p>
            <button onClick={() => resetGame()}>Try Again</button>
          </>
        ) : isBoardHidden ? (
          <>
            <p style={{ margin: 0, fontSize: "18px" }}>Ready to start?</p>
            <button
              onClick={() => {
                setIsBoardHidden(false);
                setStartTime(Date.now());
              }}
              style={{
                marginTop: "16px",
                padding: "8px 16px",
                fontSize: "16px",
                borderRadius: "4px",
              }}
            >
              Start Game
            </button>
          </>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: "18px" }}>
              Find and click numbers in order
            </p>
            <p style={{ margin: "8px 0", fontSize: "16px" }}>
              Start with 1 and count up!
            </p>
          </>
        )}
      </div>
      <table style={{ borderCollapse: "separate", borderSpacing: "4px" }}>
        <tbody>{generateRows()}</tbody>
      </table>
    </div>
  );
}

export default App;
