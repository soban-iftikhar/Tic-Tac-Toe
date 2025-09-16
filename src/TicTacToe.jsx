

import { useState, useEffect } from "react"
import cross from "./assets/cross.svg"
import circle from "./assets/circle.svg"

const TicTacToe = () => {
  const [data, setData] = useState(["", "", "", "", "", "", "", "", ""])
  const [count, setCount] = useState(0)
  const [lock, setLock] = useState(false)
  const [gameMode, setGameMode] = useState("2player") // '2player' or 'computer'
  const [difficulty, setDifficulty] = useState("medium") // 'easy', 'medium', 'hard'
  const [winner, setWinner] = useState(null)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  useEffect(() => {
    if (gameMode === "computer" && count % 2 === 1 && !lock && !winner) {
      const timer = setTimeout(() => {
        makeComputerMove()
      }, 500) // Small delay for better UX
      return () => clearTimeout(timer)
    }
  }, [count, gameMode, lock, winner])

  function toggle(index) {
    if (lock || data[index] !== "") return

    if (gameMode === "computer" && count % 2 === 1) return

    const newData = [...data]
    newData[index] = count % 2 === 0 ? "x" : "o"
    setData(newData)
    setCount(count + 1)
    checkWin(newData)
  }

  function makeComputerMove() {
    let move

    switch (difficulty) {
      case "easy":
        move = getRandomMove()
        break
      case "medium":
        move = getMediumMove()
        break
      case "hard":
        move = getOptimalMove()
        break
      default:
        move = getRandomMove()
    }

    if (move !== -1) {
      const newData = [...data]
      newData[move] = "o" // Computer is always 'o'
      setData(newData)
      setCount(count + 1)
      checkWin(newData)
    }
  }

  function getRandomMove() {
    const availableMoves = data.map((cell, index) => (cell === "" ? index : null)).filter((val) => val !== null)
    if (availableMoves.length === 0) return -1
    return availableMoves[Math.floor(Math.random() * availableMoves.length)]
  }

  function getMediumMove() {
    // 70% chance to play strategically, 30% random
    if (Math.random() < 0.7) {
      // Try to win first
      const winMove = findWinningMove("o")
      if (winMove !== -1) return winMove

      // Try to block player from winning
      const blockMove = findWinningMove("x")
      if (blockMove !== -1) return blockMove

      // Take center if available
      if (data[4] === "") return 4

      // Take corners
      const corners = [0, 2, 6, 8]
      const availableCorners = corners.filter((i) => data[i] === "")
      if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)]
      }
    }

    // Fallback to random
    return getRandomMove()
  }

  function getOptimalMove() {
    const bestMove = minimax([...data], "o")
    return bestMove.index
  }

  function minimax(board, player) {
    const availableMoves = board.map((cell, index) => (cell === "" ? index : null)).filter((val) => val !== null)

    const winner = checkWinnerForMinimax(board)
    if (winner === "o") return { score: 10 }
    if (winner === "x") return { score: -10 }
    if (availableMoves.length === 0) return { score: 0 }

    const moves = []

    for (let i = 0; i < availableMoves.length; i++) {
      const move = {}
      move.index = availableMoves[i]
      board[availableMoves[i]] = player

      if (player === "o") {
        const result = minimax(board, "x")
        move.score = result.score
      } else {
        const result = minimax(board, "o")
        move.score = result.score
      }

      board[availableMoves[i]] = ""
      moves.push(move)
    }

    let bestMove
    if (player === "o") {
      let bestScore = Number.NEGATIVE_INFINITY
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score
          bestMove = i
        }
      }
    } else {
      let bestScore = Number.POSITIVE_INFINITY
      for (let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score
          bestMove = i
        }
      }
    }

    return moves[bestMove]
  }

  function checkWinnerForMinimax(board) {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (const [a, b, c] of winPatterns) {
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        return board[a]
      }
    }
    return null
  }

  function findWinningMove(player) {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (const [a, b, c] of winPatterns) {
      const line = [data[a], data[b], data[c]]
      const emptyIndex = line.indexOf("")

      if (emptyIndex !== -1) {
        const otherTwo = line.filter((cell) => cell !== "")
        if (otherTwo.length === 2 && otherTwo[0] === player && otherTwo[1] === player) {
          return [a, b, c][emptyIndex]
        }
      }
    }
    return -1
  }

  function setIcon(index) {
    if (data[index] === "x") {
      return <img src={cross} alt="cross" className="w-20 h-20" />
    }
    if (data[index] === "o") {
      return <img src={circle} alt="circle" className="w-20 h-20" />
    }
    return null
  }

  function checkWin(board) {
    const winPatterns = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ]

    for (const [a, b, c] of winPatterns) {
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        const winnerText =
          gameMode === "computer"
            ? board[a] === "x"
              ? "You win!"
              : "Computer wins!"
            : `Player ${board[a] === "x" ? 1 : 2} wins!`
        setAlertMessage(winnerText)
        setShowAlert(true)
        setWinner(board[a])
        setLock(true)
        return
      }
    }

    if (board.every((cell) => cell !== "")) {
      setAlertMessage("It's a draw!")
      setShowAlert(true)
      setLock(true)
    }
  }

  function restart() {
    setData(["", "", "", "", "", "", "", "", ""])
    setCount(0)
    setLock(false)
    setWinner(null)
    setShowAlert(false)
    setAlertMessage("")
  }

  return (
    <>
      <section className="tictactoe">
        <h1>Tic Tac Toe</h1>

        {showAlert && (
          <div className="alert-overlay">
            <div className="neon-alert">
              <div className="alert-content">
                <h2>{alertMessage}</h2>
                <button onClick={() => setShowAlert(false)} className="alert-close">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mode-selector">
          <button
            className={gameMode === "2player" ? "active" : ""}
            onClick={() => {
              setGameMode("2player")
              restart()
            }}
          >
            2 Player
          </button>
          <button
            className={gameMode === "computer" ? "active" : ""}
            onClick={() => {
              setGameMode("computer")
              restart()
            }}
          >
            vs Computer
          </button>
        </div>

        {gameMode === "computer" && (
          <div className="difficulty-selector">
            <span>Difficulty:</span>
            <button
              className={difficulty === "easy" ? "active" : ""}
              onClick={() => {
                setDifficulty("easy")
                restart()
              }}
            >
              Easy
            </button>
            <button
              className={difficulty === "medium" ? "active" : ""}
              onClick={() => {
                setDifficulty("medium")
                restart()
              }}
            >
              Medium
            </button>
            <button
              className={difficulty === "hard" ? "active" : ""}
              onClick={() => {
                setDifficulty("hard")
                restart()
              }}
            >
              Hard
            </button>
          </div>
        )}

        {!lock && (
          <div className="current-player">
            {gameMode === "2player"
              ? `Player ${count % 2 === 0 ? 1 : 2}'s turn`
              : count % 2 === 0
                ? "Your turn"
                : "Computer thinking..."}
          </div>
        )}

        <div className="board">
          <div className="row1">
            <div className="block" onClick={() => toggle(0)}>
              {setIcon(0)}
            </div>
            <div className="block" onClick={() => toggle(1)}>
              {setIcon(1)}
            </div>
            <div className="block" onClick={() => toggle(2)}>
              {setIcon(2)}
            </div>
          </div>
          <div className="row2">
            <div className="block" onClick={() => toggle(3)}>
              {setIcon(3)}
            </div>
            <div className="block" onClick={() => toggle(4)}>
              {setIcon(4)}
            </div>
            <div className="block" onClick={() => toggle(5)}>
              {setIcon(5)}
            </div>
          </div>
          <div className="row3">
            <div className="block" onClick={() => toggle(6)}>
              {setIcon(6)}
            </div>
            <div className="block" onClick={() => toggle(7)}>
              {setIcon(7)}
            </div>
            <div className="block" onClick={() => toggle(8)}>
              {setIcon(8)}
            </div>
          </div>
        </div>

        <button onClick={restart}>Restart</button>
      </section>
    </>
  )
}

export default TicTacToe
