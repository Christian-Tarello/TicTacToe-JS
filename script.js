const Gameboard = (function () {
	const SIZE = 3;
	const EMPTY_SLOT = '';
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
		let boardString = '';
		board.forEach((row) => {
			row.forEach((symbol, columnIndex) => {
				boardString = boardString.concat(symbol || ' ');
				if (columnIndex !== row.length - 1) {
					boardString = boardString.concat('|');
				}
			});
			boardString = boardString.concat('\n');
		});
		console.log(boardString);
	}

	// Public Method
	function getBoard() {
		const boardCopy = [];
		board.forEach((row) => {
			boardCopy.push([...row]);
		});
		return boardCopy;
	}

	// Public Method
	function getSize() {
		return SIZE;
	}

	buildBoard();

	return {
		makeMove,
		cleanBoard,
		logBoard,
		getBoard,
		getSize,
	};
})();

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

	function getBotDifficulty() {
		return botDifficulty;
	}

	return {
		getName,
		getSymbol,
		isBot,
		getBotDifficulty,
	};
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
		if (
			affectedRow.every((containedSymbol) => containedSymbol === symbol)
		) {
			affectedRow.forEach((_, x) => {
				coordinates.push([x, y]);
			});
		}
		return coordinates;
	}

	// Private Method
	function getWinningColumnCoordinates(x, symbol, board) {
		const coordinates = [];
		const affectedColumn = board.map((row) => row[x]);
		if (
			affectedColumn.every(
				(containedSymbol) => containedSymbol === symbol
			)
		) {
			affectedColumn.forEach((_, y) => {
				coordinates.push([x, y]);
			});
		}
		return coordinates;
	}

	// Private Method
	function getWinningDescendingDiagonalCoordinates(x, y, symbol, board) {
		if (x !== y) {
			return [];
		}
		const coordinates = [];
		const affectedDiagonal = board.map((row, xy) => row[xy]);
		if (
			affectedDiagonal.every(
				(containedSymbol) => containedSymbol === symbol
			)
		) {
			affectedDiagonal.forEach((_, xy) => {
				coordinates.push([xy, xy]);
			});
		}
		return coordinates;
	}

	// Private Method
	function getWinningAscendingDiagonalCoordinates(x, y, symbol, board) {
		if (x + y !== BOARD_SIZE - 1) {
			return [];
		}
		const coordinates = [];
		const affectedDiagonal = board.map(
			(row, index) => board[index][BOARD_SIZE - 1 - index]
		);
		if (
			affectedDiagonal.every(
				(containedSymbol) => containedSymbol === symbol
			)
		) {
			affectedDiagonal.forEach((_, xy) => {
				coordinates.push([xy, BOARD_SIZE - 1 - xy]);
			});
		}
		return coordinates;
	}

	// Private Method
	function calculateWinningCoordinates(x, y, symbol, board) {
		const rowCoordinates = getWinningRowCoordinates(y, symbol, board);
		const columnCoordinates = getWinningColumnCoordinates(x, symbol, board);
		const descendingDiagonalCoordinates =
			getWinningDescendingDiagonalCoordinates(x, y, symbol, board);
		const ascendingDiagonalCoordinates =
			getWinningAscendingDiagonalCoordinates(x, y, symbol, board);
		winCoordinates = [
			...rowCoordinates,
			...columnCoordinates,
			...descendingDiagonalCoordinates,
			...ascendingDiagonalCoordinates,
		];
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
		if (getWinningCoordinates().length !== 0) {
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
		if (!isValidMove(x, y, boardObj.getBoard())) {
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
		isOver,
	};
}

const Minimax = (function () {
	let boardSize;
	let winningRowCoordinates;
	let winningColumnCoordinates;
	let winningDiagonalCoordinates;
	let winningCoordinates;

	function getAvailableCoordinatePairs(board) {
		const availableSlots = [];
		board.forEach((row, y) => {
			row.forEach((symbol, x) => {
				if (board[y][x] === '') {
					availableSlots.push([x, y]);
				}
			});
		});
		return availableSlots;
	}

	function generateRowWinningCoordinates() {
		winningRowCoordinates = [];
		for (let i = 0; i < boardSize; i += 1) {
			winningRowCoordinates.push([]);
			for (let j = 0; j < boardSize; j += 1) {
				winningRowCoordinates[i].push([j, i]);
			}
		}
	}

	function generateColumnWinningCoordinates() {
		winningColumnCoordinates = [];
		for (let i = 0; i < boardSize; i += 1) {
			winningColumnCoordinates.push([]);
			for (let j = 0; j < boardSize; j += 1) {
				winningColumnCoordinates[i].push([i, j]);
			}
		}
	}

	function generateDiagonalWinningCoordinates() {
		const forwardDiagonalCoordinates = [];
		const backwardDiagonalCoordinates = [];
		for (let i = 0; i < boardSize; i += 1) {
			forwardDiagonalCoordinates.push([boardSize - 1 - i, i]);
			backwardDiagonalCoordinates.push([i, i]);
		}
		winningDiagonalCoordinates = [
			forwardDiagonalCoordinates,
			backwardDiagonalCoordinates,
		];
	}

	function generateWinningCoordinates(size) {
		if (size !== boardSize) {
			boardSize = size;
			generateRowWinningCoordinates();
			generateColumnWinningCoordinates();
			generateDiagonalWinningCoordinates();
			winningCoordinates = [
				...winningRowCoordinates,
				...winningColumnCoordinates,
				...winningDiagonalCoordinates,
			];
		}
	}

	function checkForWin(board, symbol) {
		let win = false;
		winningCoordinates.forEach((coordinateCombination) => {
			if (!win) {
				win = coordinateCombination.every(
					(coordinatePair) =>
						board[coordinatePair[1]][coordinatePair[0]] === symbol
				);
			}
		});
		return win;
	}

	function difficultyToAccuracy(difficulty) {
		const accuracies = {
			easy: 0,
			medium: 70,
			hard: 90,
			unbeatable: 100,
		};
		return accuracies[difficulty.toLowerCase()];
	}

	function getMoveIndex(
		board,
		botSymbol,
		oppositeSymbol,
		depth,
		switchSymbol
	) {
		const availableSlots = getAvailableCoordinatePairs(board);
		if (!availableSlots.length) {
			return 0;
		}
		let index = switchSymbol ? Infinity : -Infinity;
		const currentSymbol = switchSymbol ? oppositeSymbol : botSymbol;
		for (let i = 0; i < availableSlots.length; i += 1) {
			const coordinatePair = availableSlots[i];
			board[coordinatePair[1]][coordinatePair[0]] = currentSymbol;
			if (checkForWin(board, currentSymbol)) {
				board[coordinatePair[1]][coordinatePair[0]] = '';
				if (currentSymbol === botSymbol) {
					return 10 - depth;
				}
				return -10 - depth;
			}

			const result = getMoveIndex(
				board,
				botSymbol,
				oppositeSymbol,
				depth + 1,
				!switchSymbol
			);
			board[coordinatePair[1]][coordinatePair[0]] = '';
			if (
				(result > index && !switchSymbol) ||
				(result < index && switchSymbol)
			) {
				index = result;
			}
		}
		return index;
	}

	function computeMove(board, botSymbol, oppositeSymbol, difficulty) {
		generateWinningCoordinates(board.length);
		const availableSlots = getAvailableCoordinatePairs(board);
		let highestIndex = -Infinity;
		let index;
		let bestMoveCoordinates;
		availableSlots.forEach((coordinatePair) => {
			board[coordinatePair[1]][coordinatePair[0]] = botSymbol;
			if (checkForWin(board, botSymbol)) {
				index = 10;
			} else {
				index = getMoveIndex(board, botSymbol, oppositeSymbol, 1, true);
			}
			board[coordinatePair[1]][coordinatePair[0]] = '';
			if (index > highestIndex) {
				highestIndex = index;
				bestMoveCoordinates = coordinatePair;
			}
		});

		const accuracy = difficultyToAccuracy(difficulty);
		const random = Math.floor(Math.random() * 100);
		if (random >= accuracy) {
			return availableSlots[
				Math.floor(Math.random() * availableSlots.length)
			];
		}
		return bestMoveCoordinates;
	}

	return { computeMove };
})();

const ScreenController = (function (board, botModule) {
	// || Initial Setup ||
	let gameInstance = Game(
		board,
		Player('Player One', 'x'),
		Player('Player Two', 'o')
	);

	// || Selects ||
	// Selection Group: Component
	const ticTacToeElement = document.querySelector('.ticTacToe');

	// Selection Group: Form
	const formElement = ticTacToeElement.querySelector('.ticTacToe-form');
	const formWrapperElement = ticTacToeElement.querySelector(
		'.ticTacToe-formWrapper'
	);
	const settingsButton = ticTacToeElement.querySelector(
		'.ticTacToe-action[data-action="settings"]'
	);
	const symbolCheckboxElements = [
		...ticTacToeElement.querySelectorAll('.ticTacToe-checkbox--symbol'),
	];
	const botCheckboxElements = [
		...ticTacToeElement.querySelectorAll('.ticTacToe-checkbox--bot'),
	];

	// Selection Group: Content
	const contentElement = ticTacToeElement.querySelector('.ticTacToe-content');
	const announcerElement = ticTacToeElement.querySelector(
		'.ticTacToe-announcer'
	);

	// Selection Group: Board
	const boardElement = ticTacToeElement.querySelector('.ticTacToe-board');
	const slotElements = [
		...ticTacToeElement.querySelectorAll('.ticTacToe-slot'),
	];
	const screenBoard = [
		slotElements.filter((element) => element.dataset.y === '0'),
		slotElements.filter((element) => element.dataset.y === '1'),
		slotElements.filter((element) => element.dataset.y === '2'),
	];

	// || Helper Functions ||
	// Function Group: Setting Active Symbol
	function setActiveSymbol() {
		boardElement.dataset.activesymbol = gameInstance
			.getActivePlayer()
			.getSymbol();
	}

	function clearActiveSymbol() {
		boardElement.dataset.activesymbol = '';
	}

	// Function Group: Setting Announcements
	function setAnnouncement(announcement) {
		announcerElement.dataset.announcement = announcement;
	}

	// Function Group: Marking Slots
	function unmarkSlots() {
		slotElements.forEach((element) => {
			element.className = 'ticTacToe-slot';
		});
	}

	function markWinningSlots() {
		const winningCoordinates = gameInstance.getWinningCoordinates();
		winningCoordinates.forEach((coordinatePair) => {
			screenBoard[coordinatePair[1]][coordinatePair[0]].classList.add(
				'ticTacToe-slot--win'
			);
		});
	}

	// Function Group: Toggle Settings
	function showGameScreen() {
		formWrapperElement.classList.add('ticTacToe-formWrapper--hidden');
		contentElement.classList.remove('ticTacToe-content--hidden');
	}

	function toggleGameScreen() {
		formWrapperElement.classList.toggle('ticTacToe-formWrapper--hidden');
		contentElement.classList.toggle('ticTacToe-content--hidden');
	}

	// Function Group: Screen Updating
	function updateBoard() {
		board.getBoard().forEach((row, y) => {
			row.forEach((symbol, x) => {
				screenBoard[y][x].dataset.symbol = symbol;
			});
		});
	}

	function updateState() {
		if (gameInstance.isOver()) {
			if (!gameInstance.isTie()) {
				markWinningSlots();
				setAnnouncement(
					`${gameInstance.getActivePlayer().getName()} Wins!`
				);
			} else {
				setAnnouncement(`It's A Tie!`);
			}
			clearActiveSymbol();
		} else {
			setAnnouncement(
				`It's ${gameInstance.getActivePlayer().getName()} Turn!`
			);
			setActiveSymbol();
		}
	}

	function updateScreen() {
		updateBoard();
		updateState();
	}

	function restartScreen() {
		Gameboard.cleanBoard();
		updateScreen();
		unmarkSlots();
	}

	// Function Group: Turn
	function handleTurn(x, y) {
		gameInstance.playTurn(x, y);
		updateScreen();
	}

	function handleBotTurn() {
		const currentPlayer = gameInstance.getActivePlayer();
		if (currentPlayer.isBot() && !gameInstance.isOver()) {
			const coordinatePair = botModule.computeMove(
				Gameboard.getBoard(),
				currentPlayer.getSymbol(),
				currentPlayer.getSymbol() === 'x' ? 'o' : 'x',
				currentPlayer.getBotDifficulty()
			);
			if (coordinatePair) {
				handleTurn(...coordinatePair);
			}
		}
	}

	// Function Group: Prepare Game
	function prepareGame() {
		restartScreen();
		showGameScreen();
		handleBotTurn();
	}

	// || Handlers ||
	// Handler Group: Content
	function slotClickHandler(e) {
		const x = parseInt(e.target.dataset.x, 10);
		const y = parseInt(e.target.dataset.y, 10);
		handleTurn(x, y);
		handleBotTurn();
	}

	// Handler Group: Header
	function settingsClickHandler() {
		toggleGameScreen();
	}

	function submitClickHandler(e) {
		e.preventDefault();
		const data = new FormData(e.target);
		const playerOne = Player(
			data.get('playerOne'),
			data.get('symbolOne') ? 'x' : 'o',
			!!data.get('botOne'),
			data.get('botOneLevel')
		);
		const playerTwo = Player(
			data.get('playerTwo'),
			data.get('symbolTwo') ? 'x' : 'o',
			!!data.get('botTwo'),
			data.get('botTwoLevel')
		);
		gameInstance = Game(Gameboard, playerOne, playerTwo);
		prepareGame();
	}

	function symbolInputHandler() {
		if (
			symbolCheckboxElements.every((element) => element.checked) ||
			symbolCheckboxElements.every((element) => !element.checked)
		) {
			symbolCheckboxElements.forEach((element) =>
				element.setCustomValidity('Same symbol not allowed.')
			);
		} else {
			symbolCheckboxElements.forEach((element) =>
				element.setCustomValidity('')
			);
		}
	}

	function botInputHandler() {
		if (botCheckboxElements.every((element) => element.checked)) {
			botCheckboxElements.forEach((element) =>
				element.setCustomValidity('Bot against bot not allowed.')
			);
		} else {
			botCheckboxElements.forEach((element) =>
				element.setCustomValidity('')
			);
		}
	}

	// || Handler Setup ||
	// Setting slot handlers
	slotElements.forEach((element) =>
		element.addEventListener('click', slotClickHandler)
	);

	// Setting action handlers
	settingsButton.addEventListener('click', settingsClickHandler);
	formElement.addEventListener('submit', submitClickHandler);

	// Validation Handlers0
	symbolCheckboxElements.forEach((element) =>
		element.addEventListener('change', symbolInputHandler)
	);
	botCheckboxElements.forEach((element) =>
		element.addEventListener('change', botInputHandler)
	);

	// || Final Setup ||
	prepareGame();
})(Gameboard, Minimax);