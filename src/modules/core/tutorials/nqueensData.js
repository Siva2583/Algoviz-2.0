export const nQueensData = {
    nqueens: {
        title: "N-Queens (Backtracking)",
        overview: "The N-Queens puzzle is the classic algorithmic problem of placing N chess queens on an N×N chessboard so that no two queens threaten each other. This means no two queens can share the same row, column, or diagonal.",
        whyExists: "It is the universally accepted 'Hello World' of Backtracking algorithms. It teaches you how to systematically search for a solution and, crucially, how to instantly abandon (backtrack) a path the moment it becomes invalid, saving massive amounts of computation compared to pure brute-force.",
        mechanics: [
            "Start at the first row (row 0).",
            "Iterate through each column in the current row.",
            "Check if placing a queen at (row, col) is safe (no other queens in the same column or diagonals).",
            "If safe, 'place' the queen and recursively move down to the next row (row + 1).",
            "If we successfully place a queen in the final row, record the board as a valid solution.",
            "If we hit a dead end (no safe columns in a row), BACKTRACK: remove the last placed queen and try the next column in the previous row."
        ],
        dryRun: [
            { step: "Start 4x4 Board. Row 0.", state: "Place Queen at [0, 0]" },
            { step: "Row 1.", state: "Cols 0, 1 unsafe. Place at [1, 2]." },
            { step: "Row 2.", state: "ALL cols unsafe! DEAD END." },
            { step: "BACKTRACK to Row 1.", state: "Remove [1, 2]. Place at [1, 3]." },
            { step: "Row 2 & Row 3.", state: "Place [2, 1] -> Place [3, 2]. SOLUTION FOUND!" }
        ],
        pseudo: `function solveNQueens(n):\n  solutions = []\n  board = empty N x N grid\n  \n  function backtrack(row):\n    // Base case: All queens placed\n    if row == n:\n      solutions.push(board.copy())\n      return\n      \n    for col from 0 to n - 1:\n      if isSafe(row, col):\n        placeQueen(row, col)\n        backtrack(row + 1)\n        \n        // CRITICAL: Undo the choice (Backtrack)\n        removeQueen(row, col)\n        \n  backtrack(0)\n  return solutions`,
        memory: "The algorithm relies heavily on Recursion, meaning it builds a Deep Call Stack. The maximum depth of the stack is N (one frame for each row). Tracking the board state takes an additional O(N) space if optimized correctly.",
        time: "O(N!) Worst Case",
        space: "O(N) Call Stack Space",
        pattern: [
            "You need to generate ALL valid combinations or permutations of a set.",
            "The problem asks to 'find all ways' to arrange something.",
            "Constraint Satisfaction Problems (like Sudoku or scheduling flights)."
        ],
        apps: [
            "Artificial Intelligence (Game trees, Chess engines, heuristics)",
            "Constraint Logic Programming (Circuit board routing)",
            "Combinatorial Optimization (Finding optimal physical arrangements)"
        ],
        mistakes: [
            "Forgetting the Backtrack step. If you place a queen, you MUST remove it after the recursive call returns. If you don't, your board state becomes permanently polluted for the next branches.",
            "Using a pure 2D matrix and running a slow O(N) loop to check `isSafe` every single time. (Pro-tip: Use three 1D arrays or HashSets to track `cols`, `positiveDiagonals`, and `negativeDiagonals` to check safety in blazing fast O(1) time!)."
        ]
    }
};