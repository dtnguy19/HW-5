const letterScores = {
    A: 1,
    B: 3,
    C: 3,
    D: 2,
    E: 1,
    F: 4,
    G: 2,
    H: 4,
    I: 1,
    J: 8,
    K: 5,
    L: 1,
    M: 3,
    N: 1,
    O: 1,
    P: 3,
    Q: 10,
    R: 1,
    S: 1,
    T: 1,
    U: 4,
    V: 4,
    W: 4,
    X: 8,
    Y: 4,
    Z: 10,
};

// Function to get the score for a letter
function getLetterScore(letter) {
    const score = letterScores[letter];

    if (score === undefined) {
        console.error(`Error: Unable to find score for letter ${letter}`);
    }

    return score || 0;
}

// Function to calculate total score for a drop target
function calculateTotalScore(dropTarget) {
    let totalScore = 0;

    dropTarget.find('.tile').each(function () {
        const letter = $(this).data('tile');
        const letterScore = getLetterScore(letter);

        if ($(this).hasClass('Triple-Letter')) {
            totalScore += 3 * letterScore;
        } else if ($(this).hasClass('Double-Letter')) {
            totalScore += 2 * letterScore;
        } else {
            totalScore += letterScore;
        }
    });

    return totalScore;
}

// Function to calculate and display the total score
function calculateAndDisplayScore() {
    let totalScore = 0;
    let pointsDisplay = '';
    let wordMultiplier = 1; // Initialize word multiplier

    // Iterate over drop targets
    $('.drop-target').each(function () {
        const dropTarget = $(this);

        // Check if the drop target has a letter
        if (
            dropTarget.hasClass('A') || dropTarget.hasClass('B') || dropTarget.hasClass('C') ||
            dropTarget.hasClass('D') || dropTarget.hasClass('E') || dropTarget.hasClass('F') ||
            dropTarget.hasClass('G') || dropTarget.hasClass('H') || dropTarget.hasClass('I') ||
            dropTarget.hasClass('J') || dropTarget.hasClass('K') || dropTarget.hasClass('L') ||
            dropTarget.hasClass('M') || dropTarget.hasClass('N') || dropTarget.hasClass('O') ||
            dropTarget.hasClass('P') || dropTarget.hasClass('Q') || dropTarget.hasClass('R') ||
            dropTarget.hasClass('S') || dropTarget.hasClass('T') || dropTarget.hasClass('U') ||
            dropTarget.hasClass('V') || dropTarget.hasClass('W') || dropTarget.hasClass('X') ||
            dropTarget.hasClass('Y') || dropTarget.hasClass('Z')
        ) {
            const letter = dropTarget.attr('class').split(' ').find(cls => /^[A-Z]$/.test(cls));
            const letterScore = getLetterScore(letter);

            // Check for special tiles
            if (dropTarget.hasClass('Triple-Letter')) {
                totalScore += 3 * letterScore;
                pointsDisplay += `(${letterScore} x Triple Letter) + `;
            } else if (dropTarget.hasClass('Double-Letter')) {
                totalScore += 2 * letterScore;
                pointsDisplay += `(${letterScore} x Double Letter) + `;
            } else {
                totalScore += letterScore;
                pointsDisplay += `${letterScore} + `;
            }

            if (dropTarget.hasClass('Triple-Word')) {
                wordMultiplier *= 3;
                pointsDisplay += 'Triple Word + ';
            } else if (dropTarget.hasClass('Double-Word')) {
                wordMultiplier *= 2;
                pointsDisplay += 'Double Word + ';
            }
        }
    });

    // Apply word multiplier to the total score
    totalScore *= wordMultiplier;

    pointsDisplay = pointsDisplay.replace(/ \+ $/, '');
    $('#points-display').text(`Points: ${pointsDisplay} = ${totalScore}`);
    $('#total-score').text(`Total Score: ${totalScore}`);
}


// Function to add a button that calculates the total score manually
function addCalculateButton() {
    // Remove existing button and display
    $('#calculate-button').remove();
    $('#points-display').remove();

    const calculateButton = $('<button id="calculate-button">Calculate Total Score</button>');
    const pointsDisplay = $('<p id="points-display">Points: </p>');

    calculateButton.click(function () {
        calculateAndDisplayScore();
    });

    // Append the button and points display
    $('body').append(calculateButton);
    $('body').append(pointsDisplay);
}

// Function to update scores UI
function updateScoresUI() {
    let totalScore = 0;

    // Iterate over drop targets
    $('.drop-target').each(function () {
        totalScore += calculateTotalScore($(this));
    });

    // Update the total score UI
    $('#total-score').text(`Total Score: ${totalScore}`);
}

// Function to deal new tiles
function dealTiles() {
    // Remove existing button and display
    $('#calculate-button').remove();
    $('#points-display').remove();

    // Number of tiles to deal
    const numTilesToDeal = 7;

    // Clear the current tiles in the rack
    $("#tile-rack").empty();

    // Remove the previous letters from drop targets
    $('.drop-target').removeClass(function (index, className) {
        return (className.match(/[A-Z]/g) || []).join(' ');
    });

    // Array to store the tile letters
    const tileLetters = Array.from({ length: 27 }, (_, i) => {
        if (i === 26) {
            return "Blank";
        }
        return String.fromCharCode(65 + i); // A to Z
    });

    // Shuffle the array to randomize tile selection
    tileLetters.sort(() => Math.random() - 0.5);

    // Select the first 7 tiles
    const selectedTiles = tileLetters.slice(0, numTilesToDeal);

    // Append the selected tiles to the rack
    selectedTiles.forEach((tileLetter, index) => {
        const tileElement = $(`<div class="tile" data-tile="${tileLetter}"> </div>`);
        tileElement.css('background-image', `url('/Users/Danny/Desktop/CODES 2023 Fall/HW5/imgs/Scrabble_Tiles/Scrabble_Tile_${tileLetter}.jpg')`);

        // Add a click event for the blank tile
        if (tileLetter === 'Blank') {
            tileElement.click(function () {
                openTilePicker();
                tileElement.off('click');
            });
        }

        $("#tile-rack").append(tileElement);
    });

    makeTilesDraggable();
    makeDropTargetsDroppable();
}

// Function to make tiles draggable
function makeTilesDraggable() {
    $('.tile').not('[data-tile="Blank"]').draggable({
        revert: 'invalid',
        zIndex: 1,
        cursor: 'move'
    });
}

// Function to make drop targets droppable
function makeDropTargetsDroppable() {
    // Make drop targets accept tiles
    $('.drop-target').droppable({
        accept: '.tile',
        drop: function (event, ui) {
            // Handle the tile drop here
            const droppedTile = ui.draggable;
            const dropTarget = $(this);

            // Get the letter of the dropped tile
            const letter = droppedTile.data('tile');

            // Remove the letter from the previous drop targets
            $('.drop-target').not(dropTarget).removeClass(`${letter}`);

            // Implement your logic for handling the drop
            console.log(`Tile ${letter} dropped on target ${dropTarget.index()}`);

            // Add a class to the drop target based on the letter
            dropTarget.addClass(`${letter}`);
            console.log(`Drop target classes after adding letter: ${dropTarget.attr('class')}`);

            $('#tile-rack').droppable({
                accept: '.tile',
                drop: function (event, ui) {
                    // Handle the tile drop onto the tile rack
                    const draggedTile = ui.draggable;
                    const tileRack = $(this);

                    // Implement your logic for handling the drop on the tile rack
                    console.log(`Tile ${draggedTile.data('tile')} dropped onto tile rack`);

                    // Make the tile draggable again
                    makeTilesDraggable();

                    // Update scores after the drop
                    updateScoresUI();
                }
            });

            // Update scores after the drop
            updateScoresUI();
        }
    });
}

// Function to open the tile picker modal
function openTilePicker() {
    // Create a modal dialog with the remaining tiles
    const modalContent = $('<div class="modal-content"></div>');
    const remainingTiles = getRemainingTiles();

    // Append each remaining tile to the modal content
    remainingTiles.forEach(tileLetter => {
        const tileElement = $('<div class="tile"></div>');
        tileElement.css('background-image', `url('/Users/Danny/Desktop/CODES 2023 Fall/HW5/imgs/Scrabble_Tiles/Scrabble_Tile_${tileLetter}.jpg')`);

        // Add a click event to choose the tile
        tileElement.click(function () {
            replaceBlankTile(tileLetter);
            $('#tilePickerModal').hide(); // Close the modal after choosing a tile
        });

        modalContent.append(tileElement);
    });

    // Append the modal content to the modal
    const modal = $('<div id="tilePickerModal" class="modal"></div>');
    modal.append(modalContent);

    // Append the modal to the body and display it
    $('body').append(modal);
    $('#tilePickerModal').show();
}

// Function to get the remaining tiles (excluding the blank tile)
function getRemainingTiles() {
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)); // A to Z
}

// Function to replace the blank tile with the chosen tile
function replaceBlankTile(newTile) {
    const blankTile = $('.tile[data-tile="Blank"]');

    // Remove the old background image
    blankTile.css('background-image', 'none');

    // Set the new background image and text for the chosen tile
    blankTile.css('background-image', `url('/Users/Danny/Desktop/CODES 2023 Fall/HW5/imgs/Scrabble_Tiles/Scrabble_Tile_${newTile}.jpg')`);

    blankTile.attr('data-tile', newTile);

    // After the replacement, make the tile draggable again
    makeTilesDraggable();
}

// Function to randomize and assign special tiles    
function assignSpecialTiles() {
    const specialTileTypes = ['Triple-Letter', 'Triple-Word', 'Double-Word'];

    // Remove existing special tiles and titles
    $('.drop-target').removeClass('Triple-Letter');
    $('.drop-target').removeClass('Triple-Word');
    $('.drop-target').removeClass('Double-Word');
    $('.special-title').remove();

    // Randomly select three unique special tiles
    const selectedSpecialTiles = [];
    while (selectedSpecialTiles.length < 3) {
        const randomIndex = Math.floor(Math.random() * 7); // Assuming there are 7 drop targets
        if (!selectedSpecialTiles.includes(randomIndex)) {
            selectedSpecialTiles.push(randomIndex);
        }
    }

    // Assign special tiles to the selected drop targets
    selectedSpecialTiles.forEach((index, i) => {
        const dropTarget = $('.drop-target').eq(index);
        dropTarget.addClass(`${specialTileTypes[i]}`);
    });
}

$(document).ready(function () {
    $("#deal-button").click(function () {
        dealTiles();
        assignSpecialTiles();
        addCalculateButton();
    });
});
