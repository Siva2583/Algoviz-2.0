const generateTraversal = (rawArray, mode) => {
    let arr = rawArray.map((val, idx) => ({
        id: `node-${idx}-${val}`,
        val: val
    }));
    const frames = [];
    const n = arr.length;
    let stats = { processed: 0, stackDepth: 0, maxDepth: 0 };
    let callStack = [];
    let processedIndices = [];
    let outputArray = [];
    const pushFrame = (activeIndex, codeLine, msg) => {
        frames.push({
            array: arr, 
            activeIndex,
            processedIndices: [...processedIndices],
            outputArray: [...outputArray],
            callStack: [...callStack],
            codeLine,
            currentStats: { ...stats },
            msg
        });
    };
    pushFrame(null, 'start', `System Ready. Initializing ${mode.toUpperCase()} Traversal.`);
    const traverse = (idx) => {
        if (idx >= n || arr[idx] === undefined || arr[idx].val === null) {
            pushFrame(idx, 'base_case', `Reached null node. Base case hit. Returning.`);
            return;
        }
        const nodeVal = arr[idx].val;
        const callName = `traverse(${nodeVal})`;
        callStack.push(callName);
        stats.stackDepth = callStack.length;
        stats.maxDepth = Math.max(stats.maxDepth, stats.stackDepth);

        pushFrame(idx, 'start', `Pushed ${callName} onto Call Stack.`);

        const processNode = () => {
            processedIndices.push(idx);
            outputArray.push(nodeVal);
            stats.processed++;
            pushFrame(idx, 'process', `Processing node [${nodeVal}]. Appending to output track.`);
        };

        if (mode === 'preorder') processNode();

        pushFrame(idx, 'left', `Diving into left child of [${nodeVal}].`);
        traverse(2 * idx + 1);
        if (mode === 'inorder') processNode();
        pushFrame(idx, 'right', `Diving into right child of [${nodeVal}].`);
        traverse(2 * idx + 2);
        if (mode === 'postorder') processNode();
        callStack.pop();
        stats.stackDepth = callStack.length;
        pushFrame(idx, 'start', `Finished evaluating [${nodeVal}]. Popping from Call Stack.`);
    };

    traverse(0);

    pushFrame(null, 'start', `${mode.toUpperCase()} Traversal Complete!`);
    return frames;
};
export const generatePreOrder = (arr) => generateTraversal(arr, 'preorder');
export const generateInOrder = (arr) => generateTraversal(arr, 'inorder');
export const generatePostOrder = (arr) => generateTraversal(arr, 'postorder');