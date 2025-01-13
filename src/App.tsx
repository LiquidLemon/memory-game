import { useState } from "react";
import "./App.css";

const SIZE = 8;

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

function createInitialArray(): [number, boolean][] {
  return shuffle(
    Array.from(
      { length: SIZE * SIZE },
      (_, i) => [i + 1, false] as [number, boolean]
    )
  );
}

function App() {
  const [numbers, setNumbers] =
    useState<[number, boolean][]>(createInitialArray);
  const [nextNumber, setNextNumber] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [wrongSquareIndex, setWrongSquareIndex] = useState<number | null>(null);

  const resetGame = () => {
    setNumbers(createInitialArray());
    setNextNumber(1);
    setIsGameOver(false);
    setStartTime(null);
    setEndTime(null);
    setWrongSquareIndex(null);
  };

  const generateRows = () => {
    const rows = [];
    for (let y = 0; y < SIZE; y++) {
      const row = [];
      for (let x = 0; x < SIZE; x++) {
        const i = y * SIZE + x;
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

              if (startTime === null) {
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
                numbers.map(([number, isSelected], index) => [
                  number,
                  index === i ? true : isSelected,
                ])
              );
              setNextNumber(newNextNumber);

              if (newNextNumber > SIZE * SIZE) {
                setEndTime(Date.now());
              }
            }}
          >
            {number}
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
          height: "160px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {nextNumber > SIZE * SIZE ? (
          <>
            <h1 style={{ margin: 0 }}>Congratulations!</h1>
            <p>You've completed the game!</p>
            <p>{getTimeString()}</p>
            <button onClick={resetGame}>Play Again</button>
          </>
        ) : isGameOver ? (
          <>
            <h1 style={{ margin: 0 }}>Game Over!</h1>
            <p>You clicked the wrong number!</p>
            <p>{getTimeString()}</p>
            <button onClick={resetGame}>Try Again</button>
          </>
        ) : (
          <div />
        )}
      </div>
      <table style={{ borderCollapse: "separate", borderSpacing: "4px" }}>
        <tbody>{generateRows()}</tbody>
      </table>
    </div>
  );
}

export default App;
