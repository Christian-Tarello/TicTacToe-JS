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
        isTie,
        isOver
    };
}

const ScreenController = (function (board) {
    // || Initial Setup ||
    let gameInstance = Game(board, Player("Player One", "x"), Player("Player Two", "o"));

    // || Selects ||
    // Selection Group: Component 
    const ticTacToeElement = document.querySelector(".ticTacToe");

    // Selection Group: Form 
    const formElement = ticTacToeElement.querySelector(".ticTacToe-form");
    const formWrapperElement = ticTacToeElement.querySelector(".ticTacToe-formWrapper");
    const settingsButton = ticTacToeElement.querySelector('.ticTacToe-action[data-action="settings"]');
    const symbolOneElement = ticTacToeElement.querySelector("#symbolOne");
    const symbolTwoElement = ticTacToeElement.querySelector("#symbolTwo");

    // Selection Group: Content 
    const contentElement = ticTacToeElement.querySelector(".ticTacToe-content");
    const announcerElement = ticTacToeElement.querySelector(".ticTacToe-announcer");

    // Selection Group: Board 
    const boardElement = ticTacToeElement.querySelector(".ticTacToe-board");
    const slotElements = [...ticTacToeElement.querySelectorAll(".ticTacToe-slot")];
    const screenBoard = [slotElements.filter((element) => element.dataset.y === "0"),
                         slotElements.filter((element) => element.dataset.y === "1"),
                         slotElements.filter((element) => element.dataset.y === "2")];
    

    // || Helper Functions ||
    // Function Group: Setting Active Symbol
    const setActiveSymbol = function () {
        boardElement.dataset.activesymbol = gameInstance.getActivePlayer().getSymbol();
    }

    const clearActiveSymbol = function () {
        boardElement.dataset.activesymbol = "";
    }

    // Function Group: Setting Announcements
    const setAnnouncement = function (announcement) {
        announcerElement.dataset.announcement = announcement;
    }
    
    // Function Group: Marking Slots
    const unmarkSlots = function () {
        slotElements.forEach((element) => {
            element.className = "ticTacToe-slot";
        })
    }

    const markWinningSlots = function () {
        const winningCoordinates = gameInstance.getWinningCoordinates();
        winningCoordinates.forEach((coordinatePair) => {
            screenBoard[coordinatePair[1]][coordinatePair[0]].classList.add("ticTacToe-slot--win")
        });
    }

    // Function Group: Screen Updating
    const updateScreen = function () {
        board.getBoard().forEach((row, y) => {
            row.forEach((symbol, x) => {
                screenBoard[y][x].dataset.symbol = symbol;
            })
        })
    };

    const restartScreen = function () {
        Gameboard.restart();
        updateScreen();
        setActiveSymbol();
        unmarkSlots();
        setAnnouncement(`It's ${gameInstance.getActivePlayer().getName()} Turn!`);
    }

    // Function Group: Toggle Settings
    const showGameScreen = function () {
        formWrapperElement.classList.add("ticTacToe-formWrapper--hidden");
        contentElement.classList.remove("ticTacToe-content--hidden");
    }

    const toggleGameScreen = function () {
        formWrapperElement.classList.toggle("ticTacToe-formWrapper--hidden");
        contentElement.classList.toggle("ticTacToe-content--hidden");
    }

    // Function Group: Game Over
    const handleGameOver = function () {
        if (!gameInstance.isTie()) {
            markWinningSlots();
            setAnnouncement(`${gameInstance.getActivePlayer().getName()} Wins!`);
        } else {
            setAnnouncement(`It's A Tie!`);
        }
    };

    // || Handlers ||
    // Handler Group: Content
    const slotClickHandler = function (e) {
        const x = parseInt(e.target.dataset.x, 10);
        const y = parseInt(e.target.dataset.y, 10);
        gameInstance.playTurn(x, y);
        updateScreen();
        if (gameInstance.isOver()) {
            handleGameOver();
            clearActiveSymbol();
        } else {
            setActiveSymbol();
            setAnnouncement(`It's ${gameInstance.getActivePlayer().getName()} Turn!`);
        }
    };

    // Handler Group: Header
    const settingsClickHandler = function () {
        toggleGameScreen();
    }

    const submitClickHandler = function (e) {
        e.preventDefault();
        const data = new FormData(e.target);
        const playerOne = Player(data.get("playerOne"), (data.get("symbolOne") ? "x" : "o"));
        const playerTwo = Player(data.get("playerTwo"), (data.get("symbolTwo") ? "x" : "o"));
        gameInstance = Game(Gameboard, playerOne, playerTwo);
        restartScreen();
        showGameScreen();
    }

    const symbolInputHandler = function (e) {
        if (symbolOneElement.checked === symbolTwoElement.checked) {
            symbolOneElement.setCustomValidity("Same symbol not allowed.");
            symbolTwoElement.setCustomValidity("Same symbol not allowed.");
        } else {
            symbolOneElement.setCustomValidity("");
            symbolTwoElement.setCustomValidity("");
        }
    }
    
    // || Final Setup ||
    // Initialize Game
    slotElements.forEach((element) => element.addEventListener("click", slotClickHandler));
    restartScreen();

    // Setting action handlers
    settingsButton.addEventListener("click", settingsClickHandler);
    formElement.addEventListener("submit", submitClickHandler);

    // Validation Handlers
    symbolOneElement.addEventListener("change", symbolInputHandler);
    symbolTwoElement.addEventListener("change", symbolInputHandler);

})(Gameboard)