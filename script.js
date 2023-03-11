const Gameboard = (function () {
    const size = 3;
    const board = [];
    const emptySlot = "";
    let winCoordinates = [];

    // Private Method
    function buildBoard() {
        for (let rowIndex = 0; rowIndex < size; rowIndex += 1) {
            board.push([]);
            for (let columnIndex = 0; columnIndex < size; columnIndex += 1) {
                board[rowIndex].push(emptySlot);            
            }        
        }
    }

    // Private Method
    function getWinningRowCoordinates(y, symbol) {
        const coordinates = [];
        const affectedRow = board[y];
        if (affectedRow.every((content) => content === symbol)) {
            affectedRow.forEach((element, x) => {
                coordinates.push([x,y]);
            })
        }
        return coordinates;
    }

    // Private Method
    function getWinningColumnCoordinates(x, symbol) {
        const coordinates = [];
        const affectedColumn = board.map(row => row[x]);
        if (affectedColumn.every((content) => content === symbol)) {
            affectedColumn.forEach((element, y) => {
                coordinates.push([x,y]);
            })
        }
        return coordinates;
    }

    // Private Method
    function getWinningDescendingDiagonalCoordinates(x, y, symbol) {
        if (x !== y) {
            return [];
        }
        const coordinates = [];
        const affectedDiagonal = board.map((row, xy) => row[xy])
        if (affectedDiagonal.every((content) => content === symbol)) {
            affectedDiagonal.forEach((element, xy) => {
                coordinates.push([xy,xy]);
            })
        }
        return coordinates;
    }

    // Private Method
    function getWinningAscendingDiagonalCoordinates(x, y, symbol) {
        if (x + y !== size - 1) {
            return [];
        }
        const coordinates = [];
        const affectedDiagonal = board.map((row, index) => board[index][(size - 1) - index])
        if (affectedDiagonal.every((content) => content === symbol)) {
            affectedDiagonal.forEach((element, xy) => {
                coordinates.push([xy, (size - 1 - xy)]);
            })
        }
        return coordinates;
    }


    // Private Method
    function calculateWinningCoordinates(x, y, symbol) {
        const rowCoordinates = getWinningRowCoordinates(y, symbol);
        const columnCoordinates = getWinningColumnCoordinates(x, symbol);
        const descendingDiagonalCoordinates = getWinningDescendingDiagonalCoordinates(x, y, symbol);
        const ascendingDiagonalCoordinates = getWinningAscendingDiagonalCoordinates(x, y, symbol);
        winCoordinates = [...rowCoordinates, ...columnCoordinates, ...descendingDiagonalCoordinates, ...ascendingDiagonalCoordinates];
    }

    // Private Method
    function isValidMove(x, y) {
        if (board[y][x] !== emptySlot) {
            return false;
        }
        return true;
    }

    // Private Method
    function clean() {
        board.forEach((row) => row.fill(emptySlot));
    }

    // Public Method
    function makeMove(x, y, symbol) {
        if (!isValidMove(x, y)) {
            return false;
        }
        board[y][x] = symbol;
        calculateWinningCoordinates(x, y, symbol);
        return true;
    }

    // Public Method
    function getWinningCoordinates() {
        return winCoordinates;
    }

    // Public Method
    function restart() {
        winCoordinates = []
        clean()
    }

    // Public Method
    function logBoard() {
        let boardString = "";
        board.forEach((row) => {
            row.forEach((symbol, columnIndex) => {
                boardString = boardString.concat((symbol || " "));
                if (columnIndex !== row.length - 1) {
                    boardString = boardString.concat("|");
                }
            })
            boardString = boardString.concat("\n");
            
        })
        console.log(boardString);
    }

    // Public Method
    function getBoard() {
        const boardCopy = [];
        board.forEach((row) => {
            boardCopy.push([...row]);
        })
        return boardCopy;
    }

    buildBoard();

    return {
        makeMove,
        getWinningCoordinates,
        restart,
        logBoard,
        getBoard
    }
})()

function Player(name, symbol) {
    let won = false;
    function getName() {
        return name;
    }
    function getSymbol() {
        return symbol;
    }
    function assignWinner() {
        won = true;
    }
    function isWinner() {
        return won;
    }
    return {
        getName,
        getSymbol,
        assignWinner,
        isWinner
    }
}

function Game(board, playerOne, playerTwo) {
    const MAX_TURNS = 9;
    let remainingTurns = MAX_TURNS;
    let activePlayer = playerOne;
    let isGameTied = false;
    let isGameOver = false;
    
    // Public Method
    function getActivePlayer() {
        return activePlayer;
    }

    // Private Method
    function switchActivePlayer() {
        activePlayer = getActivePlayer() === playerOne ? playerTwo : playerOne;
    }

    // Private Method
    function updateGameState() {
        remainingTurns -= 1;
        if (board.getWinningCoordinates().length !== 0){
            getActivePlayer().assignWinner();
            isGameOver = true;
            return;
        } 
        if (remainingTurns === 0) {
            isGameOver = true;
            isGameTied = true;
            return;
        }
        switchActivePlayer();
    }

    // Public Method
    function playTurn(x, y) {
        if (isGameOver === true) {
            return false;
        }
        const isTurnSuccesful = board.makeMove(x, y, getActivePlayer().getSymbol());
        if (!isTurnSuccesful) {
            return false;
        }
        updateGameState();
        return true;
    }

    // Public Method
    function getWinner() {
        if (playerOne.isWinner()) {
            return playerOne;
        }
        if (playerTwo.isWinner()) {
            return playerTwo;
        }
    }

    // Public Method
    function isTie() {
        return isGameTied;
    }

    // Public Method
    function isOver() {
        return isGameOver;
    }

    // Public Method
    function getWinningCoordinates() {
        return board.getWinningCoordinates();
    }

    return {
        playTurn,
        getActivePlayer,
        getWinningCoordinates,
        getWinner,
        isTie,
        isOver
    };
}