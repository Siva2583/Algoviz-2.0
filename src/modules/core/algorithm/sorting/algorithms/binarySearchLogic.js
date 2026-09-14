export const generateBinarySearchAnimations = (inputStr, targetStr) => {
  const animations = [];
  const arr = inputStr.split(',').filter(Boolean).map(Number);
  const target = Number(targetStr);
  let L = 0;
  let R = arr.length - 1;
  let M = null;
  animations.push({
    type: 'start',
    L: L,
    R: R,
    M: null,
    message: `Starting Search for Target: ${target}`
  });
  while (L <= R) {
    M = Math.floor((L + R) / 2);
    animations.push({
      type: 'eval',
      L: L,
      R: R,
      M: M,
      message: `Checking Midpoint index ${M} (Value: [ ${arr[M]} ])`
    });

    if (arr[M] === target) {
      animations.push({
        type: 'found',
        L: L,
        R: R,
        M: M,
        message: `Target ${target} found at index ${M}! 🎉`
      });
      return animations;
    } 
    
    if (arr[M] < target) {
      animations.push({
        type: 'discard_left',
        L: L,
        R: R,
        M: M,
        message: `${arr[M]} < ${target}. Discarding left half (indices ${L} to ${M}).`
      });
      
      L = M + 1;
      
      if (L <= R) {
        animations.push({
          type: 'update_bounds',
          L: L,
          R: R,
          M: null,
          message: `Left boundary moves up to index ${L}.`
        });
      }
    } else {
      animations.push({
        type: 'discard_right',
        L: L,
        R: R,
        M: M,
        message: `${arr[M]} > ${target}. Discarding right half (indices ${M} to ${R}).`
      });
      
      R = M - 1;
      
      if (L <= R) {
        animations.push({
          type: 'update_bounds',
          L: L,
          R: R,
          M: null,
          message: `Right boundary moves down to index ${R}.`
        });
      }
    }
  }
  animations.push({
    type: 'not_found',
    L: L, 
    R: R,
    M: null,
    message: `Search space exhausted. Target ${target} is not in the array.`
  });

  return animations;
};