export const treeTraversalData = {
    inorder: {
        title: "Inorder Traversal",
        overview: "Inorder Traversal explores a binary tree by visiting the Left child, then the Root node, and finally the Right child (Left → Root → Right).",
        whyExists: "Inorder traversal is the backbone of Binary Search Trees (BSTs). Because a BST stores smaller values on the left and larger on the right, exploring Left-Root-Right perfectly extracts all the data in strictly sorted (ascending) order.",
        mechanics: [
            "Start at the Root node.",
            "Recursively travel down the Left subtree until you hit a null (empty) node.",
            "Process/Print the current node.",
            "Recursively travel down the Right subtree.",
            "Return to the parent node and repeat."
        ],
        dryRun: [
            { step: "Tree: 2 is Root, 1 is Left, 3 is Right.", state: "Start at Root (2)." },
            { step: "Go Left from 2.", state: "Current Node is 1." },
            { step: "Go Left from 1 (Null), Process 1, Go Right (Null).", state: "Output: [1]" },
            { step: "Return to Root (2). Process 2.", state: "Output: [1, 2]" },
            { step: "Go Right from 2. Process 3.", state: "Output: [1, 2, 3] (Sorted!)" }
        ],
        pseudo: `function inorder(node):\n  if node == null:\n    return\n    \n  // 1. Visit Left Subtree\n  inorder(node.left)\n  \n  // 2. Process Current Node\n  print(node.value)\n  \n  // 3. Visit Right Subtree\n  inorder(node.right)`,
        memory: "Because it uses recursion, Inorder traversal relies on the Call Stack. The memory footprint depends entirely on the height of the tree. If the tree is perfectly balanced, it uses O(log N) memory. If it is completely unbalanced (like a linked list), it uses O(N) memory.",
        time: "O(N) - Visits every node once",
        space: "O(H) - Where H is the tree height",
        pattern: [
            "You need to retrieve data from a BST in sorted order.",
            "You are asked to 'Flatten a BST to a sorted array'.",
            "Finding the 'Kth Smallest Element' in a BST (Stop when count == K)."
        ],
        apps: [
            "Database Indexing (Extracting ordered records from a B-Tree)",
            "Evaluating mathematical expressions into standard infix notation (e.g., A + B)",
            "Validating if a given binary tree is actually a valid BST"
        ],
        mistakes: [
            "Assuming Inorder traversal sorts ANY binary tree. It ONLY results in sorted data if the underlying tree is specifically a Binary Search Tree (BST).",
            "Doing it iteratively without fully understanding the Stack mechanism. (Interviewers love asking you to write Iterative Inorder Traversal to test your manual Stack knowledge)."
        ]
    },
    preorder: {
        title: "Preorder Traversal",
        overview: "Preorder Traversal explores a binary tree by visiting the Root node first, then the Left child, and finally the Right child (Root → Left → Right).",
        whyExists: "Preorder perfectly captures the 'structural blueprint' of a tree. Because the parent is processed before its children, it is the absolute best algorithm to use when you need to make a clone (deep copy) of a tree, or serialize it to save to a file.",
        mechanics: [
            "Start at the Root node.",
            "Process/Print the current node IMMEDIATELY.",
            "Recursively travel down the Left subtree.",
            "Recursively travel down the Right subtree.",
            "Return to the parent node and repeat."
        ],
        dryRun: [
            { step: "Tree: 2 is Root, 1 is Left, 3 is Right.", state: "Start at Root (2)." },
            { step: "Process Root (2) immediately.", state: "Output: [2]" },
            { step: "Go Left. Process (1).", state: "Output: [2, 1]" },
            { step: "Go Right from 2. Process (3).", state: "Output: [2, 1, 3]" }
        ],
        pseudo: `function preorder(node):\n  if node == null:\n    return\n    \n  // 1. Process Current Node FIRST\n  print(node.value)\n  \n  // 2. Visit Left Subtree\n  preorder(node.left)\n  \n  // 3. Visit Right Subtree\n  preorder(node.right)`,
        memory: "Like all recursive Depth-First searches, Preorder relies on the Call Stack. It takes O(H) auxiliary space, where H is the maximum depth of the tree.",
        time: "O(N) - Visits every node once",
        space: "O(H) - Where H is the tree height",
        pattern: [
            "You need to Serialize a tree (convert it to a string/array to save to disk).",
            "You need to duplicate/clone an existing tree.",
            "Parsing Abstract Syntax Trees (Prefix/Polish notation)."
        ],
        apps: [
            "File System Traversal (Printing the parent folder name before stepping into its subfolders)",
            "Generating Polish Notation (e.g., + A B) for mathematical calculators",
            "DOM Tree rendering in web browsers"
        ],
        mistakes: [
            "When serializing a tree to save it, forgetting to record the `null` pointers. If you don't record where the empty children are, you will never be able to perfectly reconstruct the tree later!"
        ]
    },
    postorder: {
        title: "Postorder Traversal",
        overview: "Postorder Traversal explores a binary tree by visiting the Left child, then the Right child, and finally the Root node last (Left → Right → Root).",
        whyExists: "It represents a 'Bottom-Up' approach. You cannot process a parent node until you have fully processed all of its children. This makes it the only safe way to delete a tree from memory without leaving orphaned child nodes floating around.",
        mechanics: [
            "Start at the Root node.",
            "Recursively travel down the Left subtree.",
            "Recursively travel down the Right subtree.",
            "Process/Print the current node LAST.",
            "Return to the parent node and repeat."
        ],
        dryRun: [
            { step: "Tree: 2 is Root, 1 is Left, 3 is Right.", state: "Start at Root (2)." },
            { step: "Go Left to 1. No children.", state: "Process (1). Output: [1]" },
            { step: "Go Right to 3. No children.", state: "Process (3). Output: [1, 3]" },
            { step: "Return to Root. Children are done.", state: "Process (2). Output: [1, 3, 2]" }
        ],
        pseudo: `function postorder(node):\n  if node == null:\n    return\n    \n  // 1. Visit Left Subtree\n  postorder(node.left)\n  \n  // 2. Visit Right Subtree\n  postorder(node.right)\n  \n  // 3. Process Current Node LAST\n  print(node.value)`,
        memory: "Uses O(H) auxiliary space on the Call Stack. Because it must hold the parent node in memory while it fully traverses both the left and right subtrees, the stack trace gets quite deep before anything is actually 'processed'.",
        time: "O(N) - Visits every node once",
        space: "O(H) - Where H is the tree height",
        pattern: [
            "You need to Delete/Free the memory of a tree safely.",
            "You are evaluating a mathematical Syntax Tree (e.g., computing the left and right numbers before applying the parent's + or * operator).",
            "Any 'Bottom-Up' Dynamic Programming on trees."
        ],
        apps: [
            "Garbage Collection algorithms (Freeing memory in C++)",
            "Reverse Polish Notation (RPN) calculators (e.g., 3 4 +)",
            "Calculating the total size/space used by a directory and all its sub-folders"
        ],
        mistakes: [
            "Using Preorder instead of Postorder to delete a tree. If you delete the parent first, you lose the pointers to the children, causing a massive memory leak!",
            "Writing Iterative Postorder traversal. It is notoriously difficult compared to Inorder and Preorder because you must visit the parent node twice (once on the way down, once on the way up) before popping it from the stack."
        ]
    }
};