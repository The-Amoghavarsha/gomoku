import { useState, useEffect } from 'react';
import './App.css';

function Square({ value, onSquareClick, isWinning, isMobile }) {
  return (
    <button 
      className={`square ${isWinning ? 'winning-square' : ''} ${isMobile ? 'mobile-square' : ''}`} 
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, winningLine, boardSize }) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  function handleClick(i) {
    if (calculateWinner(squares, boardSize) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares);
  }

  const renderSquare = (i) => {
    const isWinning = winningLine && winningLine.includes(i);
    return (
      <Square
        key={i}
        value={squares[i]}
        onSquareClick={() => handleClick(i)}
        isWinning={isWinning}
        isMobile={isMobile}
      />
    );
  };

  const board = [];
  for (let row = 0; row < boardSize; row++) {
    const rowSquares = [];
    for (let col = 0; col < boardSize; col++) {
      rowSquares.push(renderSquare(row * boardSize + col));
    }
    board.push(
      <div key={row} className="board-row">
        {rowSquares}
      </div>
    );
  }

  return <div className="board">{board}</div>;
}

export default function Game() {
  const [boardSize, setBoardSize] = useState(15);
  const [theme, setTheme] = useState('classic');
  const [history, setHistory] = useState([Array(boardSize * boardSize).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const currentSquares = history[currentMove];
  const xIsNext = currentMove % 2 === 0;

  const { winner, winningLine } = calculateWinner(currentSquares, boardSize) || {};

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function handleRestart() {
    setHistory([Array(boardSize * boardSize).fill(null)]);
    setCurrentMove(0);
  }

  function handleBoardSizeChange(newSize) {
    setBoardSize(newSize);
    setHistory([Array(newSize * newSize).fill(null)]);
    setCurrentMove(0);
  }

  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Move #' + move;
    } else {
      description = 'Game start';
    }
    return (
      <li key={move}>
        <button 
          className={`move-button ${move === currentMove ? 'current-move' : ''}`} 
          onClick={() => jumpTo(move)}
        >
          {description}
        </button>
      </li>
    );
  });

  if (!isAscending) {
    moves.reverse();
  }

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (currentMove === boardSize * boardSize) {
    status = "It's a draw!";
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <div className={`game ${theme}`}>
      <div className="settings-panel">
        <div className="setting-group">
          <label>Board Size:</label>
          <div className="size-buttons">
            {[9, 13, 15].map(size => (
              <button
                key={size}
                className={`size-button ${boardSize === size ? 'active' : ''}`}
                onClick={() => handleBoardSizeChange(size)}
              >
                {size}x{size}
              </button>
            ))}
          </div>
        </div>
        <div className="setting-group">
          <label>Theme:</label>
          <div className="theme-buttons">
            {['classic', 'modern', 'nature', 'dark'].map(themeOption => (
              <button
                key={themeOption}
                className={`theme-button ${theme === themeOption ? 'active' : ''}`}
                onClick={() => setTheme(themeOption)}
              >
                {themeOption.charAt(0).toUpperCase() + themeOption.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="game-content">
        <div className="game-board-container">
          <div className="board-header">
            <div className="status">{status}</div>
          </div>
          <Board 
            xIsNext={xIsNext} 
            squares={currentSquares} 
            onPlay={handlePlay}
            winningLine={winningLine}
            boardSize={boardSize}
          />
        </div>
        <div className="game-info">
          <div className="game-controls">
            <button className="restart-button" onClick={handleRestart}>
              Restart Game
            </button>
            <button className="sort-button" onClick={() => setIsAscending(!isAscending)}>
              {isAscending ? '▼ Descending' : '▲ Ascending'}
            </button>
          </div>
          <div className="moves-section">
            <div className="moves-header">Moves ({moves.length})</div>
            <ol className="moves-list">{moves}</ol>
          </div>
        </div>
      </div>
    </div>
  );
}

function calculateWinner(squares, boardSize) {
  const lines = [];

  // Generate all possible winning lines (horizontal, vertical, diagonal)
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // Horizontal
      if (col <= boardSize - 5) {
        lines.push([
          row * boardSize + col,
          row * boardSize + col + 1,
          row * boardSize + col + 2,
          row * boardSize + col + 3,
          row * boardSize + col + 4,
        ]);
      }
      
      // Vertical
      if (row <= boardSize - 5) {
        lines.push([
          row * boardSize + col,
          (row + 1) * boardSize + col,
          (row + 2) * boardSize + col,
          (row + 3) * boardSize + col,
          (row + 4) * boardSize + col,
        ]);
      }
      
      // Diagonal \
      if (row <= boardSize - 5 && col <= boardSize - 5) {
        lines.push([
          row * boardSize + col,
          (row + 1) * boardSize + col + 1,
          (row + 2) * boardSize + col + 2,
          (row + 3) * boardSize + col + 3,
          (row + 4) * boardSize + col + 4,
        ]);
      }
      
      // Diagonal /
      if (row <= boardSize - 5 && col >= 4) {
        lines.push([
          row * boardSize + col,
          (row + 1) * boardSize + col - 1,
          (row + 2) * boardSize + col - 2,
          (row + 3) * boardSize + col - 3,
          (row + 4) * boardSize + col - 4,
        ]);
      }
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c, d, e] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c] &&
      squares[a] === squares[d] &&
      squares[a] === squares[e]
    ) {
      return { winner: squares[a], winningLine: lines[i] };
    }
  }
  return null;
}
