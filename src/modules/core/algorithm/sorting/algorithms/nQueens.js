export function nQueensAnimation(n) {
  const animations = [];
  const cols = new Array(n).fill(-1);
  const d1 = new Array(2 * n).fill(-1);
  const d2 = new Array(2 * n).fill(-1);

  function solve(row) {
    if (row === n) {
      return true;
    }

    for (let col = 0; col < n; col++) {
      let id1 = row + col;
      let id2 = col - row + n;

      animations.push({ type: 'inspect', row, col });

      if (cols[col] !== -1 || d1[id1] !== -1 || d2[id2] !== -1) {
        let conflictRow = -1;
        let conflictCol = -1;
        let conflictType = '';

        if (cols[col] !== -1) {
          conflictType = 'Vertical';
          conflictRow = cols[col];
          conflictCol = col;
        } else if (d1[id1] !== -1) {
          conflictType = 'Diagonal';
          conflictRow = d1[id1];
          conflictCol = id1 - conflictRow;
        } else if (d2[id2] !== -1) {
          conflictType = 'Diagonal';
          conflictRow = d2[id2];
          conflictCol = id2 + conflictRow - n;
        }

        animations.push({ type: 'conflict', row, col, conflictRow, conflictCol, conflictType });
        continue;
      }

      d1[id1] = row;
      d2[id2] = row;
      cols[col] = row;
      animations.push({ type: 'place', row, col });

      if (solve(row + 1)) {
        return true;
      }

      d1[id1] = -1;
      d2[id2] = -1;
      cols[col] = -1;
      animations.push({ type: 'remove', row, col });
    }
    return false;
  }

  solve(0);
  return animations;
}