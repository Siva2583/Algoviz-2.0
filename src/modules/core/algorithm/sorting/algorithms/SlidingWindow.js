export const generateWindow = (inputStr, targetsum) => {
    let a = 0;
    let arr = inputStr.split(',').filter(Boolean).map(Number);
    let tsum = Number(targetsum);
    if (!arr.length || arr.some(n => !Number.isFinite(n) || n <= 0) || !Number.isFinite(tsum) || tsum <= 0) return [{ type: 'result', L: 0, R: 0, sum: 0, bestSize: 0, msg: 'Use positive numbers and a positive target.' }];
    let cursum = 0;
    let mini = Number.MAX_VALUE;
    const animations = [];

    for (let b = 0; b < arr.length; b++) {
        animations.push({
            type: "expand_right", 
            L: a, R: b, 
            msg: `Expanding pointer R to the right...`, 
            sum: cursum, bestSize: mini
        });

        cursum += arr[b];

        animations.push({
            type: "check_condition", 
            L: a, R: b, 
            msg: `Checking if current sum (${cursum}) >= target (${tsum})...`, 
            sum: cursum, bestSize: mini
        });

        while (cursum >= tsum) {
            if (cursum >= tsum) {
                mini = Math.min(mini, b - a + 1);
                
                animations.push({
                    type: "record_best", 
                    L: a, R: b, 
                    msg: `Target reached or exceeded! Recording best window size...`, 
                    sum: cursum, bestSize: mini
                });
            }

            cursum -= arr[a];
            a++; 

            animations.push({
                type: "shrink_left", 
                L: a, R: b, 
                msg: `Shrinking the Window from the left to optimize...`, 
                sum: cursum, bestSize: mini 
            });
        }
    }
    
    mini = (mini === Number.MAX_VALUE) ? 0 : mini;
    
    animations.push({
        type: "result", 
        L: a, R: arr.length - 1,
        msg: `Finished! Best size of window for sum ${targetsum} is ${mini}.`, 
        sum: cursum, bestSize: mini
    });

    return animations; 
}