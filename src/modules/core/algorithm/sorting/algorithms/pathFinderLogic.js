export function runPathfinder(grid, startNode, endNode, algorithm) {
    // Work on an isolated graph: React state is never mutated by execution.
    grid = grid.map(row => row.map(node => ({ ...node, isVisited: false, previousNode: null })));
    startNode = grid[startNode.row][startNode.col];
    endNode = grid[endNode.row][endNode.col];
    const visitedNodesInOrder = [];
    let nodesInShortestPathOrder = [];

    if (algorithm === 'bfs') {
        const queue = [startNode];
        startNode.isVisited = true;

        while (queue.length) {
            const currentNode = queue.shift();
            
            if (currentNode.isWall) continue;
            
            visitedNodesInOrder.push(currentNode);

            if (currentNode === endNode) {
                nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);
                break;
            }

            const unvisitedNeighbors = getUnvisitedNeighbors(currentNode, grid);
            for (const neighbor of unvisitedNeighbors) {
                neighbor.isVisited = true;
                neighbor.previousNode = currentNode;
                queue.push(neighbor);
            }
        }
    } 
    
    else if (algorithm === 'dfs') {
        const stack = [startNode];
        
        while (stack.length) {
            const currentNode = stack.pop();

            if (currentNode.isWall || currentNode.isVisited) continue;
            
            currentNode.isVisited = true;
            visitedNodesInOrder.push(currentNode);

            if (currentNode === endNode) {
                nodesInShortestPathOrder = getNodesInShortestPathOrder(endNode);
                break;
            }

            const unvisitedNeighbors = getUnvisitedNeighbors(currentNode, grid);
            // Reversing helps it prioritize typical Top-Right-Bottom-Left visual exploration
            for (const neighbor of unvisitedNeighbors.reverse()) {
                if (!neighbor.isVisited) {
                    neighbor.previousNode = currentNode;
                    stack.push(neighbor);
                }
            }
        }
    }
    else { throw new Error('Supported algorithms: bfs, dfs'); }

    return { visitedNodesInOrder, nodesInShortestPathOrder };
}

function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const { col, row } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    
    return neighbors.filter(neighbor => !neighbor.isVisited && !neighbor.isWall);
}

function getNodesInShortestPathOrder(finishNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode;
    
    while (currentNode !== null) {
        nodesInShortestPathOrder.unshift(currentNode); 
        currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
}