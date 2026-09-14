export const generateMergeIntervals = (rawIntervals) => {
    // 1. Assign unique IDs to track DOM elements during sorting and melding
    let intervals = rawIntervals.map((interval, index) => ({
        id: `block-${index}`,
        start: interval[0],
        end: interval[1]
    }));

    const animations = [];
    animations.push({
        type: "initial",
        msg: "Loaded unmerged intervals into the Input Buffer.",
        intervals: JSON.parse(JSON.stringify(intervals)),
        merged: []
    });

    intervals.sort((a, b) => a.start - b.start);
    animations.push({
        type: "sort",
        msg: "O(N log N) Sort: Physically reordering blocks by their start times.",
        intervals: JSON.parse(JSON.stringify(intervals)),
        merged: []
    });

    const merged = [];
    merged.push({...intervals[0]}); 

    animations.push({
        type: "drop",
        msg: `Dropping the first interval [${intervals[0].start}, ${intervals[0].end}] into the Output Buffer.`,
        intervals: JSON.parse(JSON.stringify(intervals)),
        merged: JSON.parse(JSON.stringify(merged)),
        activeId: intervals[0].id
    });

    for (let i = 1; i < intervals.length; i++) {
        let current = intervals[i];
        let previous = merged[merged.length - 1];

        animations.push({
            type: "compare",
            msg: `Comparing [${current.start}, ${current.end}] with [${previous.start}, ${previous.end}]. Is ${current.start} <= ${previous.end}?`,
            intervals: JSON.parse(JSON.stringify(intervals)),
            merged: JSON.parse(JSON.stringify(merged)),
            activeId: current.id,
            compareTargetId: previous.id
        });

        if (current.start <= previous.end) {
            let oldEnd = previous.end;
            previous.end = Math.max(previous.end, current.end);

            animations.push({
                type: "meld",
                msg: `Overlap True! ${current.start} <= ${oldEnd}. Absorbing block and stretching right boundary to ${previous.end}.`,
                intervals: JSON.parse(JSON.stringify(intervals)),
                merged: JSON.parse(JSON.stringify(merged)),
                fadingId: current.id,  
                stretchingId: previous.id 
            });
        } else {
            merged.push({...current});
            animations.push({
                type: "drop",
                msg: `No overlap (${current.start} > ${previous.end}). Dropping block into a new slot.`,
                intervals: JSON.parse(JSON.stringify(intervals)),
                merged: JSON.parse(JSON.stringify(merged)),
                activeId: current.id
            });
        }
    }

    animations.push({
        type: "complete",
        msg: "O(N) Greedy sweep complete! All intervals successfully merged.",
        intervals: JSON.parse(JSON.stringify(intervals)),
        merged: JSON.parse(JSON.stringify(merged))
    });

    return animations;
};