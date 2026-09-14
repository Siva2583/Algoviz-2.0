export const generateBinaryAnimations = (inputStr, targetStr) => {
  const animations = [];
  const arr = inputStr.split(',').filter(Boolean).map(Number);
  const target = Number(targetStr);

  let leftLock = -1;
  let rightLock = -1;

  let L = 0;
  let R = arr.length - 1;

  animations.push({ type: 'start', message: `Pass 1: Hunting for the FIRST occurrence of ${target}...` });

  while (L <= R) {
    let M = Math.floor((L + R) / 2);
    animations.push({ type: 'eval', L, R, M, message: `Checking index ${M} (Value: [ ${arr[M]} ])` });

    if (arr[M] === target) {
      leftLock = M;
      animations.push({
        type: 'found_temp',
        L, R, M,
        message: `Target found at index ${M}! But is there an earlier one? Discarding right half.`
      });
      R = M - 1;
      if (L <= R) animations.push({ type: 'update_bounds', L, R, M: null, message: `Right boundary moves down to ${R}.` });
    } else if (arr[M] < target) {
      animations.push({ type: 'discard_left', L, R, M, message: `${arr[M]} < ${target}. Discarding left half.` });
      L = M + 1;
      if (L <= R) animations.push({ type: 'update_bounds', L, R, M: null, message: `Left boundary moves up to ${L}.` });
    } else {
      animations.push({ type: 'discard_right', L, R, M, message: `${arr[M]} > ${target}. Discarding right half.` });
      R = M - 1;
      if (L <= R) animations.push({ type: 'update_bounds', L, R, M: null, message: `Right boundary moves down to ${R}.` });
    }
  }

  if (leftLock === -1) {
     animations.push({ type: 'not_found', message: `Target ${target} is not in the array.` });
     return animations;
  }

  animations.push({ type: 'lock_left', index: leftLock, message: `Pass 1 Complete! First occurrence locked at index ${leftLock}.` });

  animations.push({ type: 'reset_for_pass_two', message: `Pass 2: Resetting bounds to hunt for the LAST occurrence of ${target}...` });

  L = 0;
  R = arr.length - 1;

  while (L <= R) {
    let M = Math.floor((L + R) / 2);
    animations.push({ type: 'eval', L, R, M, message: `Checking index ${M} (Value: [ ${arr[M]} ])` });

    if (arr[M] === target) {
      rightLock = M;
      animations.push({
        type: 'found_temp',
        L, R, M,
        message: `Target found at index ${M}! But is there a later one? Discarding left half.`
      });
      L = M + 1;
      if (L <= R) animations.push({ type: 'update_bounds', L, R, M: null, message: `Left boundary moves up to ${L}.` });
    } else if (arr[M] < target) {
      animations.push({ type: 'discard_left', L, R, M, message: `${arr[M]} < ${target}. Discarding left half.` });
      L = M + 1;
      if (L <= R) animations.push({ type: 'update_bounds', L, R, M: null, message: `Left boundary moves up to ${L}.` });
    } else {
      animations.push({ type: 'discard_right', L, R, M, message: `${arr[M]} > ${target}. Discarding right half.` });
      R = M - 1;
      if (L <= R) animations.push({ type: 'update_bounds', L, R, M: null, message: `Right boundary moves down to ${R}.` });
    }
  }

  animations.push({ type: 'lock_right', index: rightLock, message: `Pass 2 Complete! Last occurrence locked at index ${rightLock}.` });
  animations.push({ type: 'complete_range', left: leftLock, right: rightLock, message: `Success! Target range is [${leftLock}, ${rightLock}].` });

  return animations;
};