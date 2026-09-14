export const generateInsertionSort = (rawArray) => {
    let arr = rawArray.map((val, index) => ({
        id: `block-${index}`,
        val: val,
        isLifting: false
    }));

    const frames = [];
    const n = arr.length;
    const sortedIndices = [0];
    let stats = { passes: 0, comps: 0, swaps: 0 };

    const cloneArray = () => arr.map(item => ({ ...item }));

    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
        isSwapping: false, minimumIndex: null, codeLine: 'start',
        currentStats: { ...stats }, msg: "System Ready. Initializing Insertion Sort."
    });

    for (let i = 1; i < n; i++) {
        stats.passes++;
        arr[i].isLifting = true;

        frames.push({
            array: cloneArray(), activeIndices: [i], sortedIndices: [...sortedIndices],
            isSwapping: false, minimumIndex: null, codeLine: 'outer',
            currentStats: { ...stats }, msg: `Pass ${stats.passes}: Lifting index ${i} (value ${arr[i].val}).`
        });

        let j = i;

        while (j > 0) {
            stats.comps++;
            frames.push({
                array: cloneArray(), activeIndices: [j, j - 1], sortedIndices: [...sortedIndices],
                isSwapping: false, minimumIndex: null, codeLine: 'compare',
                currentStats: { ...stats }, msg: `Comparing lifted value ${arr[j].val} with ${arr[j - 1].val}.`
            });

            if (arr[j].val < arr[j - 1].val) {
                stats.swaps++;
                frames.push({
                    array: cloneArray(), activeIndices: [j, j - 1], sortedIndices: [...sortedIndices],
                    isSwapping: true, minimumIndex: null, codeLine: 'swap',
                    currentStats: { ...stats }, msg: `${arr[j].val} < ${arr[j - 1].val}. Shifting block right.`
                });

                let temp = arr[j];
                arr[j] = arr[j - 1];
                arr[j - 1] = temp;

                frames.push({
                    array: cloneArray(), activeIndices: [j, j - 1], sortedIndices: [...sortedIndices],
                    isSwapping: false, minimumIndex: null, codeLine: 'swap',
                    currentStats: { ...stats }, msg: `Shift complete.`
                });

                j--;
            } else {
                frames.push({
                    array: cloneArray(), activeIndices: [j, j - 1], sortedIndices: [...sortedIndices],
                    isSwapping: false, minimumIndex: null, codeLine: 'break',
                    currentStats: { ...stats }, msg: `${arr[j].val} >= ${arr[j - 1].val}. Correct position found.`
                });
                break;
            }
        }

        arr[j].isLifting = false;
        sortedIndices.push(i);

        frames.push({
            array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
            isSwapping: false, minimumIndex: null, codeLine: 'drop',
            currentStats: { ...stats }, msg: `Dropping block into position.`
        });
    }

    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...Array(n).keys()],
        isSwapping: false, minimumIndex: null, codeLine: 'start',
        currentStats: { ...stats }, msg: "Insertion Sort Complete! Array is fully sorted."
    });

    return frames;
};