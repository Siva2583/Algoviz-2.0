export const generateQuickSort = (rawArray) => {
    let arr = rawArray.map((val, index) => ({
        id: `block-${index}`,
        val: val
    }));
    
    const stats = { passes: 0, swaps: 0, comps: 0 };
    const frames = [];
    const n = arr.length;
    const sortedIndices = [];
    
    const cloneArray = () => arr.map(item => ({ ...item }));
    
    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
        isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'start',
        currentStats: { ...stats }, msg: "System Ready. Initializing Quick Sort."
    });

    function quickSortHelper(low, high) {
        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [low, high], codeLine: 'start',
            currentStats: { ...stats }, msg: `QuickSort called on sub-array [${low} to ${high}].`
        });

        if (low >= high) {
            frames.push({
                array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
                isSwapping: false, pivotIndex: null, subArrayRange: [low, high], codeLine: 'base_case',
                currentStats: { ...stats }, msg: `Base case reached.`
            });
            
            if (low === high) {
                sortedIndices.push(low);
                frames.push({
                    array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
                    isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'base_case',
                    currentStats: { ...stats }, msg: `Index ${low} is sorted.`
                });
            }
            return;
        }

        stats.passes++;
        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [low, high], codeLine: 'partition',
            currentStats: { ...stats }, msg: `Partitioning sub-array [${low} to ${high}].`
        });

        const pi = partition(low, high);

        sortedIndices.push(pi);
        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: pi, subArrayRange: [low, high], codeLine: 'partition',
            currentStats: { ...stats }, msg: `Partition complete. Pivot locked at index ${pi}.`
        });

        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [low, pi - 1], codeLine: 'recurse_left',
            currentStats: { ...stats }, msg: `Recursively calling QuickSort on left sub-array.`
        });
        quickSortHelper(low, pi - 1);

        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [pi + 1, high], codeLine: 'recurse_right',
            currentStats: { ...stats }, msg: `Recursively calling QuickSort on right sub-array.`
        });
        quickSortHelper(pi + 1, high);
    }

    function partition(low, high) {
        const pivot = arr[high].val;
        let i = low - 1;

        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: high, subArrayRange: [low, high], codeLine: 'partition',
            currentStats: { ...stats }, msg: `Selecting ${pivot} at index ${high} as the pivot.`
        });

        for (let j = low; j < high; j++) {
            stats.comps++;
            frames.push({
                array: cloneArray(), activeIndices: [j], sortedIndices: [...sortedIndices],
                isSwapping: false, pivotIndex: high, subArrayRange: [low, high], codeLine: 'compare',
                currentStats: { ...stats }, msg: `Comparing ${arr[j].val} with pivot ${pivot}.`
            });

            if (arr[j].val <= pivot) {
                i++;
                
                if (i !== j) {
                    stats.swaps++;
                    frames.push({
                        array: cloneArray(), activeIndices: [i, j], sortedIndices: [...sortedIndices],
                        isSwapping: true, pivotIndex: high, subArrayRange: [low, high], codeLine: 'swap',
                        currentStats: { ...stats }, msg: `${arr[j].val} <= ${pivot}. Swapping elements.`
                    });

                    let temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;

                    frames.push({
                        array: cloneArray(), activeIndices: [i, j], sortedIndices: [...sortedIndices],
                        isSwapping: false, pivotIndex: high, subArrayRange: [low, high], codeLine: 'swap',
                        currentStats: { ...stats }, msg: `Swap complete.`
                    });
                } else {
                    frames.push({
                        array: cloneArray(), activeIndices: [i, j], sortedIndices: [...sortedIndices],
                        isSwapping: false, pivotIndex: high, subArrayRange: [low, high], codeLine: 'swap',
                        currentStats: { ...stats }, msg: `${arr[j].val} <= ${pivot}, but already in correct position.`
                    });
                }
            }
        }

        if (i + 1 !== high) {
            stats.swaps++;
            frames.push({
                array: cloneArray(), activeIndices: [i + 1, high], sortedIndices: [...sortedIndices],
                isSwapping: true, pivotIndex: high, subArrayRange: [low, high], codeLine: 'swap',
                currentStats: { ...stats }, msg: `Loop complete. Swapping pivot into correct position.`
            });

            let temp = arr[i + 1];
            arr[i + 1] = arr[high];
            arr[high] = temp;

            frames.push({
                array: cloneArray(), activeIndices: [i + 1, high], sortedIndices: [...sortedIndices],
                isSwapping: false, pivotIndex: i + 1, subArrayRange: [low, high], codeLine: 'swap',
                currentStats: { ...stats }, msg: `Pivot is now in its sorted position.`
            });
        } else {
             frames.push({
                array: cloneArray(), activeIndices: [high], sortedIndices: [...sortedIndices],
                isSwapping: false, pivotIndex: high, subArrayRange: [low, high], codeLine: 'swap',
                currentStats: { ...stats }, msg: `Pivot is already in its correct position.`
            });
        }

        return i + 1;
    }

    quickSortHelper(0, n - 1);

    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...Array(n).keys()],
        isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'start',
        currentStats: { ...stats }, msg: "Quick Sort Complete! Array is fully sorted."
    });

    return frames;
};