export const generateBubbleSort = (rawArray) => {
    let arr = rawArray.map((val, index) => ({
        id: `block-${index}`,
        val: val
    }));

    const frames = [];
    const n = arr.length;
    const sortedIndices = [];
    let stats = { passes: 0, comps: 0, swaps: 0 };

    const cloneArray = () => arr.map(item => ({ ...item }));

    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
        isSwapping: false, minimumIndex: null, codeLine: 'start',
        currentStats: { ...stats },
        msg: "System Ready. Initializing Bubble Sort."
    });

    for (let i = 0; i < n; i++) {
        stats.passes++;
        
        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, minimumIndex: null, codeLine: 'outer',
            currentStats: { ...stats },
            msg: `Pass ${stats.passes} of ${n}.`
        });

        for (let j = 0; j < n - i - 1; j++) {
            frames.push({
                array: cloneArray(), activeIndices: [j, j + 1], sortedIndices: [...sortedIndices],
                isSwapping: false, minimumIndex: null, codeLine: 'inner',
                currentStats: { ...stats },
                msg: `Scanning window at index ${j} and ${j + 1}.`
            });

            stats.comps++; 
            frames.push({
                array: cloneArray(), activeIndices: [j, j + 1], sortedIndices: [...sortedIndices],
                isSwapping: false, minimumIndex: null, codeLine: 'compare',
                currentStats: { ...stats },
                msg: `Comparing ${arr[j].val} and ${arr[j + 1].val}. Is ${arr[j].val} > ${arr[j + 1].val}?`
            });

            if (arr[j].val > arr[j + 1].val) {
                stats.swaps++; 
                frames.push({
                    array: cloneArray(), activeIndices: [j, j + 1], sortedIndices: [...sortedIndices],
                    isSwapping: true, minimumIndex: null, codeLine: 'swap',
                    currentStats: { ...stats },
                    msg: `Yes! ${arr[j].val} > ${arr[j + 1].val}. Swapping blocks...`
                });

                let temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;

                frames.push({
                    array: cloneArray(), activeIndices: [j, j + 1], sortedIndices: [...sortedIndices],
                    isSwapping: false, minimumIndex: null, codeLine: 'swap',
                    currentStats: { ...stats },
                    msg: `Swap complete.`
                });
            } else {
                frames.push({
                    array: cloneArray(), activeIndices: [j, j + 1], sortedIndices: [...sortedIndices],
                    isSwapping: false, minimumIndex: null, codeLine: 'compare',
                    currentStats: { ...stats },
                    msg: `No swap needed. Moving window forward.`
                });
            }
        }

        sortedIndices.push(n - i - 1);
        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, minimumIndex: null, codeLine: 'outer',
            currentStats: { ...stats },
            msg: `Pass complete. Block locked into its final sorted position.`
        });
    }

    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...Array(n).keys()],
        isSwapping: false, minimumIndex: null, codeLine: 'start',
        currentStats: { ...stats },
        msg: "Bubble Sort Complete! Array is fully sorted."
    });

    return frames;
};