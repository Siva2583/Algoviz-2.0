export const generateMergeSort = (rawArray) => {
    let arr = rawArray.map((val, index) => ({
        id: `block-${index}`,
        val: val,
        yOffset: 0
    }));

    const stats = { passes: 0, swaps: 0, comps: 0 }; 
    const frames = [];
    const n = arr.length;
    let sortedIndices = [];

    const cloneArray = () => arr.map(item => ({ ...item }));

    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [],
        isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'start',
        currentStats: { ...stats }, msg: "System Ready. Initializing Merge Sort."
    });

    function mergeSortHelper(low, high) {
        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [low, high], codeLine: 'start',
            currentStats: { ...stats }, msg: `Dividing sub-array [${low} to ${high}].`
        });

        if (low >= high) {
            frames.push({
                array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
                isSwapping: false, pivotIndex: null, subArrayRange: [low, high], codeLine: 'base_case',
                currentStats: { ...stats }, msg: `Base case reached (Single element).`
            });
            return;
        }

        const mid = Math.floor((low + high) / 2);
        stats.passes++;

        frames.push({
            array: cloneArray(), activeIndices: [mid], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [low, high], codeLine: 'mid',
            currentStats: { ...stats }, msg: `Calculated midpoint at index ${mid}.`
        });

        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [low, mid], codeLine: 'recurse_left',
            currentStats: { ...stats }, msg: `Recursively calling left half [${low} to ${mid}].`
        });
        mergeSortHelper(low, mid);

        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [mid + 1, high], codeLine: 'recurse_right',
            currentStats: { ...stats }, msg: `Recursively calling right half [${mid + 1} to ${high}].`
        });
        mergeSortHelper(mid + 1, high);

        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [low, high], codeLine: 'merge_call',
            currentStats: { ...stats }, msg: `Merging halves [${low} to ${mid}] and [${mid + 1} to ${high}].`
        });
        
        merge(low, mid, high);
    }

    function merge(low, mid, high) {
        for (let i = low; i <= high; i++) {
            arr[i].yOffset = 80;
        }
        
        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [low, high], codeLine: 'buffer',
            currentStats: { ...stats }, msg: `Pulling elements into temporary O(N) memory buffer.`
        });

        let tempArr = [];
        for(let i = low; i <= high; i++) tempArr.push({...arr[i]});
        
        let leftIdx = 0;
        let rightIdx = mid - low + 1;
        let k = low;

        while (leftIdx <= mid - low && rightIdx <= high - low) {
            stats.comps++;
            const actualLeftIdx = low + leftIdx;
            const actualRightIdx = low + rightIdx;

            frames.push({
                array: cloneArray(), activeIndices: [actualLeftIdx, actualRightIdx], sortedIndices: [...sortedIndices],
                isSwapping: false, pivotIndex: null, subArrayRange: [low, high], codeLine: 'compare',
                currentStats: { ...stats }, msg: `Comparing ${tempArr[leftIdx].val} and ${tempArr[rightIdx].val}.`
            });

            if (tempArr[leftIdx].val <= tempArr[rightIdx].val) {
                stats.swaps++; 
                arr[k] = tempArr[leftIdx];
                arr[k].yOffset = 0;
                
                frames.push({
                    array: cloneArray(), activeIndices: [k], sortedIndices: [...sortedIndices],
                    isSwapping: true, pivotIndex: null, subArrayRange: [low, high], codeLine: 'write_left',
                    currentStats: { ...stats }, msg: `${arr[k].val} is smaller. Writing to main array.`
                });
                leftIdx++;
            } else {
                stats.swaps++;
                arr[k] = tempArr[rightIdx];
                arr[k].yOffset = 0; 
                
                frames.push({
                    array: cloneArray(), activeIndices: [k], sortedIndices: [...sortedIndices],
                    isSwapping: true, pivotIndex: null, subArrayRange: [low, high], codeLine: 'write_right',
                    currentStats: { ...stats }, msg: `${arr[k].val} is smaller. Writing to main array.`
                });
                rightIdx++;
            }
            k++;
        }

        let hasRem = leftIdx <= mid - low || rightIdx <= high - low;
        if(hasRem) {
             frames.push({
                array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
                isSwapping: false, pivotIndex: null, subArrayRange: [low, high], codeLine: 'write_rem',
                currentStats: { ...stats }, msg: `Copying remaining sorted elements.`
            });
        }

        while (leftIdx <= mid - low) {
            stats.swaps++;
            arr[k] = tempArr[leftIdx];
            arr[k].yOffset = 0;
            frames.push({
                array: cloneArray(), activeIndices: [k], sortedIndices: [...sortedIndices],
                isSwapping: true, pivotIndex: null, subArrayRange: [low, high], codeLine: 'write_rem',
                currentStats: { ...stats }, msg: `Pushing remaining element ${arr[k].val}.`
            });
            leftIdx++;
            k++;
        }

        while (rightIdx <= high - low) {
            stats.swaps++;
            arr[k] = tempArr[rightIdx];
            arr[k].yOffset = 0;
            frames.push({
                array: cloneArray(), activeIndices: [k], sortedIndices: [...sortedIndices],
                isSwapping: true, pivotIndex: null, subArrayRange: [low, high], codeLine: 'write_rem',
                currentStats: { ...stats }, msg: `Pushing remaining element ${arr[k].val}.`
            });
            rightIdx++;
            k++;
        }
        
        if (low === 0 && high === n - 1) {
            for(let i=0; i<n; i++) sortedIndices.push(i);
        }
    }

    mergeSortHelper(0, n - 1);

    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...Array(n).keys()],
        isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'start',
        currentStats: { ...stats }, msg: "Merge Sort Complete! Array is fully sorted."
    });

    return frames;
};