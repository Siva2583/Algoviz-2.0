export const pathfinderData = {

    bfs: {
        title: "Breadth-First Search (BFS)",
        overview: "BFS explores a grid like a ripple in a pond. It checks all immediate neighbors (1 step away) before moving to nodes that are 2 steps away. Because it explores uniformly in all directions, it is mathematically guaranteed to find the shortest path in an unweighted grid.",
        whyExists: "BFS was invented to find the mathematically shortest path in an unweighted network. Before BFS, routing was done blindly (DFS), which often resulted in massive, inefficient detours.",
        mechanics: [
            "Initialize an empty Queue and push the starting node.",
            "Mark the starting node as visited.",
            "While the Queue is not empty, pop the front node.",
            "Check if the popped node is the target. If yes, stop!",
            "Otherwise, find all valid, unvisited neighbors (Up, Down, Left, Right).",
            "Mark them as visited, record where they came from (for the path), and push them to the Queue."
        ],
        dryRun: [
            { step: "Start at [0,0]. Target is [0,2].", state: "Queue: [[0,0]]" },
            { step: "Pop [0,0]. Add neighbor [0,1].", state: "Queue: [[0,1]]" },
            { step: "Pop [0,1]. Add neighbor [0,2].", state: "Queue: [[0,2]]" },
            { step: "Pop [0,2]. TARGET FOUND!", state: "Queue: [] | Path: [0,0] → [0,1] → [0,2]" }
        ],
        pseudo: `function BFS(grid, start, target):\n  queue = [start]\n  visited = {start}\n\n  while queue is not empty:\n    current = queue.shift()\n    \n    if current == target: return reconstructPath(current)\n\n    for neighbor in getNeighbors(current):\n      if neighbor not in visited and not isWall(neighbor):\n        visited.add(neighbor)\n        neighbor.previous = current\n        queue.push(neighbor)`,
        memory: "BFS relies entirely on a Queue (FIFO - First In, First Out). In memory, this means the footprint grows significantly as the search expands outward, peaking at the widest layer of the graph (O(W) where W is the maximum width).",
        time: "O(V + E)",
        space: "O(V)",
        pattern: [
            "You need the 'shortest path' or 'minimum steps' in a grid/matrix.",
            "The edges are unweighted (all moves cost 1).",
            "The problem explicitly asks for 'Level Order Traversal'."
        ],
        apps: [
            "GPS Navigation (Unweighted maps)", 
            "Peer-to-Peer Networks (BitTorrent)", 
            "Social Network 'Degrees of Separation' (e.g. LinkedIn connections)"
        ],
        mistakes: [
            "Marking a node as visited AFTER popping it from the queue (causes duplicate nodes in the queue and crashes the browser memory).",
            "Using a standard Array with `.shift()` for the queue in languages like Python or JS, which takes O(N) time. (Always mention you would use a true Deque in an interview)."
        ]
    },
    dfs: {
        title: "Depth-First Search (DFS)",
        overview: "DFS is the 'maze runner' algorithm. It aggressively dives as deep as possible down a single path until it hits a dead end (or a wall). When it gets stuck, it backtracks to the last intersection and tries a different path. It DOES NOT guarantee the shortest path.",
        whyExists: "DFS is the fundamental algorithm for exploring every possible configuration of a system. It was designed for topological sorting, cycle detection, and solving puzzles where you just need *a* valid path, not necessarily the shortest one.",
        mechanics: [
            "Initialize an empty Stack (or use recursion) and push the starting node.",
            "While the Stack is not empty, pop the top node.",
            "If it hasn't been visited, mark it as visited.",
            "Check if it's the target. If yes, stop!",
            "Push all valid, unvisited neighbors onto the Stack."
        ],
        dryRun: [
            { step: "Start at [0,0]. Target is [0,2].", state: "Stack: [[0,0]]" },
            { step: "Pop [0,0]. Push neighbors [1,0] then [0,1].", state: "Stack: [[1,0], [0,1]]" },
            { step: "Pop [0,1]. Push neighbor [0,2].", state: "Stack: [[1,0], [0,2]]" },
            { step: "Pop [0,2]. TARGET FOUND!", state: "Stack: [[1,0]]" }
        ],
        pseudo: `function DFS(grid, start, target):\n  stack = [start]\n  visited = set()\n\n  while stack is not empty:\n    current = stack.pop()\n    \n    if current == target: return reconstructPath(current)\n    if current in visited: continue\n\n    visited.add(current)\n\n    for neighbor in getNeighbors(current):\n      if not isWall(neighbor):\n        neighbor.previous = current\n        stack.push(neighbor)`,
        memory: "DFS relies on a Stack (LIFO - Last In, First Out). In memory, this footprint only grows as deep as the longest path in the graph (O(H) where H is the maximum height/depth). It is generally much more memory-efficient than BFS for wide trees.",
        time: "O(V + E)",
        space: "O(H) max depth",
        pattern: [
            "You need to explore ALL possible paths (Backtracking).",
            "You are looking for cycle detection in a graph.",
            "You are grouping connected components (e.g., 'Number of Islands' on LeetCode)."
        ],
        apps: [
            "Solving Mazes or Sudoku puzzles", 
            "Game AI (Minimax algorithm)", 
            "File System Crawlers"
        ],
        mistakes: [
            "Using it to find the shortest path. It will find a path quickly, but it is rarely the optimal one.",
            "Causing a Stack Overflow by using recursion on a massive 10,000+ node grid. Use an explicit array Stack for safety."
        ]
    },
    dijkstra: {
        title: "Dijkstra's Algorithm",
        overview: "Dijkstra's Algorithm is the father of modern routing. Instead of treating all steps equally, it assigns 'weights' (or costs) to edges. It uses a Min-Priority Queue to always explore the cheapest known path first. In an unweighted grid, it behaves exactly like BFS.",
        whyExists: "BFS fails when roads have different speed limits or traffic. Dijkstra was invented in 1956 to solve the 'Shortest Path Problem' for weighted graphs, forming the foundation of modern digital mapping and internet packet routing.",
        mechanics: [
            "Set the distance to the Start node to 0, and all other nodes to Infinity.",
            "Insert all nodes into a Min-Priority Queue.",
            "While the queue is not empty, extract the node with the minimum distance.",
            "If the node is a wall or its distance is Infinity (trapped), skip it.",
            "For each unvisited neighbor, calculate the new distance (current distance + edge weight).",
            "If the new distance is smaller than the neighbor's current distance, update it and reorder the queue."
        ],
        dryRun: [
            { step: "Start node distance = 0. All others = ∞.", state: "PQ: [ (Start, 0), (A, ∞) ]" },
            { step: "Extract Start(0). Update neighbor A to distance 1.", state: "PQ: [ (A, 1), (B, ∞) ]" },
            { step: "Extract A(1). Update neighbor B to distance 2.", state: "PQ: [ (B, 2) ]" },
            { step: "Extract Target. TARGET FOUND!", state: "Shortest Path Cost: 2" }
        ],
        pseudo: `function Dijkstra(grid, start, target):\n  start.distance = 0\n  unvisitedNodes = getAllNodes(grid) // Use Min-Heap in production\n\n  while unvisitedNodes is not empty:\n    sort(unvisitedNodes by distance)\n    current = unvisitedNodes.shift()\n    \n    if current.distance == Infinity: break\n    if current == target: return reconstructPath(current)\n\n    for neighbor in getNeighbors(current):\n      newDist = current.distance + edgeWeight(current, neighbor)\n      if newDist < neighbor.distance:\n        neighbor.distance = newDist\n        neighbor.previous = current`,
        memory: "Dijkstra requires a Priority Queue (Min-Heap) and a distance table mapping every node to its current shortest distance. This makes its memory footprint O(V) to store the heap and the tables.",
        time: "O(V log V + E)",
        space: "O(V)",
        pattern: [
            "You need the shortest path in a WEIGHTED graph.",
            "You are navigating network routing with variable costs.",
            "You need to minimize total cost/effort to reach a target."
        ],
        apps: [
            "Google Maps / Apple Maps routing engines", 
            "Network Routing Protocols (OSPF)", 
            "Flight agenda optimization"
        ],
        mistakes: [
            "Trying to use it on graphs with negative edge weights. It will fail completely; you must use the Bellman-Ford algorithm for negative weights.",
            "Forgetting to use a Min-Heap and using a normal array instead, which ruins the O(V log V) time complexity by making the extraction O(V)."
        ]
    }

};