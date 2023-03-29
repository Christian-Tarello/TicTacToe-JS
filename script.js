const Gameboard = (function () {
    const SIZE = 3;
    const EMPTY_SLOT = "";
    const board = [];

    // Private Method
    function buildBoard() {
        for (let rowIndex = 0; rowIndex < SIZE; rowIndex += 1) {
            board.push([]);
            for (let columnIndex = 0; columnIndex < SIZE; columnIndex += 1) {
                board[rowIndex].push(EMPTY_SLOT);            
            }        
        }
    }

    // Public Method
    function cleanBoard() {
        board.forEach((row) => row.fill(EMPTY_SLOT));
    }

    // Public Method
    function makeMove(x, y, symbol) {
        board[y][x] = symbol;
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

    // Public Method
    function getSize(){
        return SIZE;
    }

    buildBoard();

    return {
        makeMove,
        cleanBoard,
        logBoard,
        getBoard,
        getSize
    }
})()

function Player(name, symbol, isPlayerBot, botDifficulty) {
    function isBot() {
        return isPlayerBot;
    }
    
    function getName() {
        return name;
    }

    function getSymbol() {
        return symbol;
    }

    function getBotDifficulty(){
        return botDifficulty;
    }

    return {
        getName,
        getSymbol,
        isBot,
        getBotDifficulty
    }
}

function Game(boardObj, playerOne, playerTwo) {
    const MAX_TURNS = 9;
    const BOARD_SIZE = boardObj.getSize();
    let winCoordinates = [];
    let remainingTurns = MAX_TURNS;
    let activePlayer = playerOne;
    let isGameTied = false;
    let isGameOver = false;

    // Function Group: Manage Active Player    
    // Public Method
    function getActivePlayer() {
        return activePlayer;
    }

    // Private Method
    function switchActivePlayer() {
        activePlayer = getActivePlayer() === playerOne ? playerTwo : playerOne;
    }

    // Function Group: Win Validation
    // Private Method
    function getWinningRowCoordinates(y, symbol, board) {
        const coordinates = [];
        const affectedRow = board[y];
        if (affectedRow.every((containedSymbol) => containedSymbol === symbol)) {
            affectedRow.forEach((_, x) => {
                coordinates.push([x,y]);
            })
        }
        return coordinates;
    }

    // Private Method
    function getWinningColumnCoordinates(x, symbol, board) {
        const coordinates = [];
        const affectedColumn = board.map(row => row[x]);
        if (affectedColumn.every((containedSymbol) => containedSymbol === symbol)) {
            affectedColumn.forEach((_, y) => {
                coordinates.push([x,y]);
            })
        }
        return coordinates;
    }

    // Private Method
    function getWinningDescendingDiagonalCoordinates(x, y, symbol, board) {
        if (x !== y) {
            return [];
        }
        const coordinates = [];
        const affectedDiagonal = board.map((row, xy) => row[xy])
        if (affectedDiagonal.every((containedSymbol) => containedSymbol === symbol)) {
            affectedDiagonal.forEach((_, xy) => {
                coordinates.push([xy,xy]);
            })
        }
        return coordinates;
    }

    // Private Method
    function getWinningAscendingDiagonalCoordinates(x, y, symbol, board) {
        if (x + y !== BOARD_SIZE - 1) {
            return [];
        }
        const coordinates = [];
        const affectedDiagonal = board.map((row, index) => board[index][(BOARD_SIZE - 1) - index])
        if (affectedDiagonal.every((containedSymbol) => containedSymbol === symbol)) {
            affectedDiagonal.forEach((_, xy) => {
                coordinates.push([xy, (BOARD_SIZE - 1 - xy)]);
            })
        }
        return coordinates;
    }


    // Private Method
    function calculateWinningCoordinates(x, y, symbol, board) {
        const rowCoordinates = getWinningRowCoordinates(y, symbol, board);
        const columnCoordinates = getWinningColumnCoordinates(x, symbol, board);
        const descendingDiagonalCoordinates = getWinningDescendingDiagonalCoordinates(x, y, symbol, board);
        const ascendingDiagonalCoordinates = getWinningAscendingDiagonalCoordinates(x, y, symbol, board);
        winCoordinates = [...rowCoordinates, ...columnCoordinates, ...descendingDiagonalCoordinates, ...ascendingDiagonalCoordinates];
    }

    // Public Method
    function getWinningCoordinates() {
        return winCoordinates;
    }

    // Private Method
    function isValidMove(x, y, board) {
        if (isGameOver === true || board[y][x]) {
            return false;
        }
        return true;
    }

    // Function Group: Game Logic
    // Private Method
    function updateGameState() {
        remainingTurns -= 1;
        if (getWinningCoordinates().length !== 0){
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
        if (!isValidMove(x, y, boardObj.getBoard())){
            return false;
        }
        const activeSymbol = getActivePlayer().getSymbol();
        boardObj.makeMove(x, y, activeSymbol);
        calculateWinningCoordinates(x, y, activeSymbol, boardObj.getBoard());
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

    return {
        playTurn,
        getActivePlayer,
        getWinningCoordinates,
        isTie,
        isOver
    };
}

const Minimax = (function () {
    function getAvailableCoordinatePairs(board) {
        const availableSlots = [];
        board.forEach((row, y) => {
            row.forEach((symbol, x) => {
                if (board[y][x] === "") {
                    availableSlots.push([x,y])
                }
            })
        })
        return availableSlots;
    }

    function computeMove(board, botSymbol) {
        const availableSlots = getAvailableCoordinatePairs(board);
        if (!availableSlots) {
            return [];
        }
        const random = Math.floor(Math.random() * availableSlots.length);
        console.log(availableSlots, availableSlots[random]);
        return availableSlots[random]
    }

    

    return {computeMove};
})();

const ScreenController = (function (board, botModule) {
    // || Initial Setup ||
    let gameInstance = Game(board, Player("Player One", "x"), Player("Player Two", "o"));

    // || Selects ||
    // Selection Group: Component 
    const ticTacToeElement = document.querySelector(".ticTacToe");

    // Selection Group: Form 
    const formElement = ticTacToeElement.querySelector(".ticTacToe-form");
    const formWrapperElement = ticTacToeElement.querySelector(".ticTacToe-formWrapper");
    const settingsButton = ticTacToeElement.querySelector('.ticTacToe-action[data-action="settings"]');
    const symbolCheckboxElements = [...ticTacToeElement.querySelectorAll(".ticTacToe-checkbox--symbol")];
    const botCheckboxElements = [...ticTacToeElement.querySelectorAll(".ticTacToe-checkbox--bot")];

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

    // Function Group: Toggle Settings
    const showGameScreen = function () {
        formWrapperElement.classList.add("ticTacToe-formWrapper--hidden");
        contentElement.classList.remove("ticTacToe-content--hidden");
    }

    const toggleGameScreen = function () {
        formWrapperElement.classList.toggle("ticTacToe-formWrapper--hidden");
        contentElement.classList.toggle("ticTacToe-content--hidden");
    }

    // Function Group: Screen Updating
    const updateBoard = function () {
        board.getBoard().forEach((row, y) => {
            row.forEach((symbol, x) => {
                screenBoard[y][x].dataset.symbol = symbol;
            })
        })
    };

    const updateState = function () {
        if (gameInstance.isOver()) {
            if (!gameInstance.isTie()) {
                markWinningSlots();
                setAnnouncement(`${gameInstance.getActivePlayer().getName()} Wins!`);
            } else {
                setAnnouncement(`It's A Tie!`);
            }
            clearActiveSymbol();
        } else {
            setAnnouncement(`It's ${gameInstance.getActivePlayer().getName()} Turn!`);
            setActiveSymbol();
        }
    }

    const updateScreen = function () {
        updateBoard();
        updateState();
    }

    const restartScreen = function () {
        Gameboard.cleanBoard();
        updateScreen();
        unmarkSlots();
    }

    // Function Group: Turn
    const handleTurn = function (x, y) {
        gameInstance.playTurn(x, y);
        updateScreen();
    }

    const handleBotTurn = function() {
        const currentPlayer = gameInstance.getActivePlayer();
        if (currentPlayer.isBot() && !gameInstance.isOver()) {
            const coordinatePair = botModule.computeMove(Gameboard.getBoard(), currentPlayer.getSymbol());
            if (coordinatePair) {
                handleTurn(...coordinatePair);
            }
        }
    }

    // Function Group: Prepare Game
    const prepareGame = function() {
        restartScreen();
        showGameScreen();
        handleBotTurn();
    }

    // || Handlers ||
    // Handler Group: Content
    const slotClickHandler = function (e) {
        const x = parseInt(e.target.dataset.x, 10);
        const y = parseInt(e.target.dataset.y, 10);
        handleTurn(x, y);
        handleBotTurn();
    };

    // Handler Group: Header
    const settingsClickHandler = function () {
        toggleGameScreen();
    }

    const submitClickHandler = function (e) {
        e.preventDefault();
        const data = new FormData(e.target);
        const playerOne = Player(
            data.get("playerOne"),
            (data.get("symbolOne") ? "x" : "o"),
            !!data.get("botOne"),
            data.get("botOneLevel")
            );
        const playerTwo = Player(
            data.get("playerTwo"),
            (data.get("symbolTwo") ? "x" : "o"),
            !!data.get("botTwo"),
            data.get("botTwoLevel")
            );
        gameInstance = Game(Gameboard, playerOne, playerTwo);
        prepareGame();
    }

    const symbolInputHandler = function () {
        if (
            symbolCheckboxElements.every((element) => element.checked) ||
            symbolCheckboxElements.every((element) => !element.checked)
        ){
            symbolCheckboxElements.forEach((element) => element.setCustomValidity("Same symbol not allowed."));
        } else {
            symbolCheckboxElements.forEach((element) => element.setCustomValidity(""));
        }
    }

    const botInputHandler = function () {
        if (botCheckboxElements.every((element) => element.checked)){
            botCheckboxElements.forEach((element) => element.setCustomValidity("Bot against bot not allowed."));
        } else {
            botCheckboxElements.forEach((element) => element.setCustomValidity(""));
        }
    }
    
    // || Handler Setup ||
    // Setting slot handlers
    slotElements.forEach((element) => element.addEventListener("click", slotClickHandler));
    

    // Setting action handlers
    settingsButton.addEventListener("click", settingsClickHandler);
    formElement.addEventListener("submit", submitClickHandler);

    // Validation Handlers0
    symbolCheckboxElements.forEach((element) => element.addEventListener("change", symbolInputHandler));
    botCheckboxElements.forEach((element) => element.addEventListener("change", botInputHandler));

    // || Final Setup ||
    prepareGame();

})(Gameboard, Minimax);