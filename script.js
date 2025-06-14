(function () {
    'use strict';

    // Generate Sudoku grid inputs
    const gridContainer = document.getElementById('sudoku-grid');
    for (let i = 0; i < 81; i++) {
        const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('maxlength', '1');
        input.setAttribute('inputmode', 'numeric');
        input.setAttribute('pattern', '[1-9]');
        input.classList.add('sudoku-input');
        input.setAttribute('aria-label', `Sudoku cell ${Math.floor(i / 9) + 1} row, ${i % 9 + 1} column`);
        input.dataset.index = i;
        gridContainer.appendChild(input);
    }

    // Helpers to convert between index and row/col
    function indexToRowCol(index) {
        return [Math.floor(index / 9), index % 9];
    }

    // Read the current puzzle from inputs
    function readGrid() {
        const inputs = gridContainer.querySelectorAll('input.sudoku-input');
        const grid = Array(9).fill(null).map(() => Array(9).fill(0));
        for (let i = 0; i < 81; i++) {
            let val = inputs[i].value.trim();
            if (val === '') {
                grid[Math.floor(i / 9)][i % 9] = 0;
            } else {
                let num = parseInt(val, 10);
                if (num >= 1 && num <= 9) {
                    grid[Math.floor(i / 9)][i % 9] = num;
                } else {
                    // If invalid number, treat as empty
                    grid[Math.floor(i / 9)][i % 9] = 0;
                }
            }
        }
        return grid;
    }

    // Write the solved puzzle back to inputs
    function writeGrid(grid) {
        const inputs = gridContainer.querySelectorAll('input.sudoku-input');
        for (let i = 0; i < 81; i++) {
            const [row, col] = indexToRowCol(i);
            inputs[i].value = grid[row][col] === 0 ? '' : grid[row][col];
        }
    }

    // Validate if a number can be placed safely in the grid position
    function isSafe(grid, row, col, num) {
        // Check row for duplicate
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num) {
                return false;
            }
        }
        // Check column for duplicate
        for (let x = 0; x < 9; x++) {
            if (grid[x][col] === num) {
                return false;
            }
        }
        // Check 3x3 subgrid for duplicate
        const startRow = row - row % 3;
        const startCol = col - col % 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (grid[startRow + r][startCol + c] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    // Backtracking solver function
    function solveSudoku(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isSafe(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (solveSudoku(grid)) {
                                return true;
                            }
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Button event listeners
    const solveBtn = document.getElementById('solve-btn');
    const clearBtn = document.getElementById('clear-btn');

    solveBtn.addEventListener('click', () => {
        // Read grid values
        let puzzle = readGrid();

        // Solve the puzzle
        const solved = solveSudoku(puzzle);

        if (solved) {
            writeGrid(puzzle);
            solveBtn.textContent = 'Solved';
            setTimeout(() => { solveBtn.innerHTML = '<span class="material-icons" aria-hidden="true">play_arrow</span> Solve'; }, 1500);
        } else {
            alert('No valid solution found for this puzzle.');
        }
    });

    clearBtn.addEventListener('click', () => {
        const inputs = gridContainer.querySelectorAll('input.sudoku-input');
        inputs.forEach(input => input.value = '');
        solveBtn.innerHTML = '<span class="material-icons" aria-hidden="true">play_arrow</span> Solve';
        inputs[0].focus();
    });

    // Input validation: only allow digits 1-9
    gridContainer.addEventListener('input', e => {
        if (e.target.matches('.sudoku-input')) {
            let val = e.target.value;
            if (val.length > 1) {
                val = val.slice(0, 1);
            }
            if (!/^[1-9]$/.test(val)) {
                e.target.value = '';
            } else {
                e.target.value = val;
            }
        }
    });

    // Keyboard navigation inside grid
    gridContainer.addEventListener('keydown', e => {
        const inputs = Array.from(gridContainer.querySelectorAll('input.sudoku-input'));
        const currentIndex = inputs.indexOf(e.target);
        if (currentIndex === -1) return;

        switch (e.key) {
            case 'ArrowRight':
            case 'Tab':
                if (!e.shiftKey) {
                    e.preventDefault();
                    const nextIndex = (currentIndex + 1) % 81;
                    inputs[nextIndex].focus();
                }
                break;
            case 'ArrowLeft':
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + 81) % 81;
                inputs[prevIndex].focus();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const upIndex = (currentIndex - 9 + 81) % 81;
                inputs[upIndex].focus();
                break;
            case 'ArrowDown':
                e.preventDefault();
                const downIndex = (currentIndex + 9) % 81;
                inputs[downIndex].focus();
                break;
            case 'Backspace':
            case 'Delete':
                e.target.value = '';
                break;
        }
    });
})();
