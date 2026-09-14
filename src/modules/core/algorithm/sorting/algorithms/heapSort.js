export const generateHeapSort = (rawArray) => {
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
        currentStats: { ...stats }, msg: "System Ready. Initializing Heap Sort."
    });

    function heapify(size, i, phaseMsg) {
        let maxIdx = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        let nodesToHighlight = [i];
        if (left < size) nodesToHighlight.push(left);
        if (right < size) nodesToHighlight.push(right);

        frames.push({
            array: cloneArray(), activeIndices: nodesToHighlight, sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'pointers',
            currentStats: { ...stats }, msg: `${phaseMsg}: Evaluating Parent [${arr[i].val}] at index ${i}.`
        });

        stats.comps++;
        if (left < size && arr[left].val > arr[maxIdx].val) {
            maxIdx = left;
        }

        stats.comps++;
        if (right < size && arr[right].val > arr[maxIdx].val) {
            maxIdx = right;
        }

        frames.push({
            array: cloneArray(), activeIndices: nodesToHighlight, sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'compare_children',
            currentStats: { ...stats }, msg: `Comparing with children. Largest value is ${arr[maxIdx].val}.`
        });

        if (maxIdx !== i) {
            stats.swaps++;
            frames.push({
                array: cloneArray(), activeIndices: [i, maxIdx], sortedIndices: [...sortedIndices],
                isSwapping: true, pivotIndex: null, subArrayRange: [], codeLine: 'swap_heapify',
                currentStats: { ...stats }, msg: `Sinking down: Swapping ${arr[i].val} with ${arr[maxIdx].val}.`
            });

            let temp = arr[i];
            arr[i] = arr[maxIdx];
            arr[maxIdx] = temp;

            frames.push({
                array: cloneArray(), activeIndices: [i, maxIdx], sortedIndices: [...sortedIndices],
                isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'swap_heapify',
                currentStats: { ...stats }, msg: `Recursively heapifying the affected sub-tree.`
            });

            heapify(size, maxIdx, phaseMsg);
        }
    }

    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
        isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'build_heap',
        currentStats: { ...stats }, msg: `Phase 1: Building Max Heap from bottom-up.`
    });

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(n, i, 'Building Heap');
    }
    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...sortedIndices],
        isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'extract',
        currentStats: { ...stats }, msg: `Phase 2: Extracting maximum elements to sort array.`
    });

    for (let i = n - 1; i > 0; i--) {
        stats.passes++;
        stats.swaps++;
        
        frames.push({
            array: cloneArray(), activeIndices: [0, i], sortedIndices: [...sortedIndices],
            isSwapping: true, pivotIndex: null, subArrayRange: [], codeLine: 'swap_root',
            currentStats: { ...stats }, msg: `Extracting Max [${arr[0].val}] and swapping with end of heap.`
        });

        let temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;

        sortedIndices.push(i);

        frames.push({
            array: cloneArray(), activeIndices: [0], sortedIndices: [...sortedIndices],
            isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'heapify_root',
            currentStats: { ...stats }, msg: `Max element locked. Restoring heap property.`
        });

        heapify(i, 0, 'Extracting');
    }
    sortedIndices.push(0);

    frames.push({
        array: cloneArray(), activeIndices: [], sortedIndices: [...Array(n).keys()],
        isSwapping: false, pivotIndex: null, subArrayRange: [], codeLine: 'start',
        currentStats: { ...stats }, msg: "Heap Sort Complete! Array is fully sorted."
    });

    return frames;
};