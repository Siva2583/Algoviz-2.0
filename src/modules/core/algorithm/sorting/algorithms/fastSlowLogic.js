export const generateFastSlowAnimations = (inputStr) => {
  const animations = [];
  let arr = inputStr.split(',');
  let slow = 0;

  for (let fast = 0; fast < arr.length; fast++) {
    animations.push({
      type: 'eval',
      slow: slow,
      fast: fast,
      message: `Evaluating index ${fast}: [ ${arr[fast]} ]`
    });

    if (arr[fast] !== '0') {
      if (slow !== fast) {
        const temp = arr[slow];
        arr[slow] = arr[fast];
        arr[fast] = temp;

        animations.push({
          type: 'swap',
          slow: slow,
          fast: fast,
          currentArray: [...arr],
          message: `Non-zero found! Swapping [ ${arr[slow]} ] ↔ [ ${arr[fast]} ]`
        });
      } else {
        animations.push({
          type: 'match',
          slow: slow,
          fast: fast,
          message: `Non-zero already at slow pointer.`
        });
      }

      slow++;
      
      animations.push({
        type: 'move_slow',
        slow: slow,
        fast: fast,
        message: `Moving slow pointer inward (slow++)`
      });
    } else {
      animations.push({
        type: 'ignore',
        slow: slow,
        fast: fast,
        message: `Zero detected. Fast pointer scouting ahead.`
      });
    }
  }

  animations.push({
    type: 'complete',
    slow: null,
    fast: null,
    message: `Array processed. Zeroes successfully moved!`
  });

  return animations;
};