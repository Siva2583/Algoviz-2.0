
export const generateTwoPointersAnimations = (inputStr) => {
  const animations = [];
  let arr = inputStr.split('');
  let L = 0;
  let R = arr.length - 1;

  while (L < R) {
    animations.push({ 
      type: 'select', 
      L: L, 
      R: R, 
      charL: arr[L], 
      charR: arr[R],
      message: `Selected [ ${arr[L]} ] and [ ${arr[R]} ]`
    });
    const temp = arr[L];
    arr[L] = arr[R];
    arr[R] = temp;
    
    animations.push({ 
      type: 'swap', 
      L: L, 
      R: R, 
      currentArray: [...arr],
      message: `Swapped! [ ${arr[L]} ] ↔ [ ${arr[R]} ]`
    });
    L++;
    R--;
    
    animations.push({ 
      type: 'move', 
      L: L, 
      R: R,
      message: `Moving pointers inward (L++, R--)`
    });
  }
  if (L === R) {
     animations.push({
       type: 'meet',
       L: L,
       R: R,
       message: `Pointers met at index ${L}. Reversal complete!`
     });
  } else {
     animations.push({
       type: 'complete',
       L: null,
       R: null,
       message: `Pointers crossed. Reversal complete!`
     });
  }

  return animations;
};