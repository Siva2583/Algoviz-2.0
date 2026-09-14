export const generateSelectionSort = (rawArray) => {
    let arr = rawArray.map((val, index) => ({
        id: `block-${index}`,
        val: val
    }));
    const stats={passes:0,swaps:0,comps:0};
    const frames=[];
    const n=arr.length;
    const sortedIndices=[];
    const cloneArray=()=>arr.map(item=>({...item}));
    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
        isSwapping: false, minimumIndex: null, codeLine: 'start',
        currentStats: { ...stats }, msg: "System Ready. Initializing Selection Sort."
    });
    for(let i=0;i<n-1;i++){
        let minIndex=i;
        stats.passes++;
        frames.push({
            array: cloneArray(), activeIndices: [i], sortedIndices: [...sortedIndices],
            isSwapping: false, minimumIndex: minIndex, codeLine: 'outer',
            currentStats: { ...stats }, msg: `Pass ${stats.passes}: Assuming index ${i} (value ${arr[i].val}) is the minimum.`
        });
        for(let j=i+1;j<n;j++){
            stats.comps++;
            frames.push({
                array: cloneArray(), activeIndices: [j], sortedIndices: [...sortedIndices],
                isSwapping: false, minimumIndex: minIndex, codeLine: 'inner',
                currentStats: { ...stats }, msg: `Scanning index ${j} (value ${arr[j].val}). Current min is ${arr[minIndex].val}.`
            });
            if(arr[minIndex].val>arr[j].val){
                minIndex = j;
                frames.push({
                    array: cloneArray(), activeIndices: [j], sortedIndices: [...sortedIndices],
                    isSwapping: false, minimumIndex: minIndex, codeLine: 'new_min',
                    currentStats: { ...stats }, msg: `Found new minimum: ${arr[minIndex].val} at index ${minIndex}.`
                });
            }
        }
        if (minIndex !== i) {
            stats.swaps++;
            frames.push({
                array: cloneArray(), activeIndices: [i, minIndex], sortedIndices: [...sortedIndices],
                isSwapping: true, minimumIndex: minIndex, codeLine: 'swap',
                currentStats: { ...stats }, msg: `Pass complete. Swapping current index ${i} with minimum element ${arr[minIndex].val}.`
            });

            let temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;

            frames.push({
                array: cloneArray(), activeIndices: [i, minIndex], sortedIndices: [...sortedIndices],
                isSwapping: false, minimumIndex: i, codeLine: 'swap',
                currentStats: { ...stats }, msg: `Swap complete.`
            });
        }
    
    sortedIndices.push(i);
        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, minimumIndex: null, codeLine: 'lock',
            currentStats: { ...stats }, msg: `Element ${arr[i].val} locked into its final sorted position.`
        });
    }
    sortedIndices.push(n - 1);

    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
        isSwapping: false, minimumIndex: null, codeLine: 'start',
        currentStats: { ...stats }, msg: "Selection Sort Complete! Array is fully sorted."
    });
    return frames;
}