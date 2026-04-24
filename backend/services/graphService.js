const processHierarchies = (data) => {
    const invalid_entries = [];
    const duplicate_edges = [];
    const valid_edges = [];
    const seen_edges = new Set();
    const parent_map = new Map();
    const children_map = new Map();
    const all_nodes = new Set();

    // 1. Parsing and Validation
    data.forEach(item => {
        const str = typeof item === 'string' ? item : "";
        const trimmed = str.trim();
        const regex = /^[A-Z]->[A-Z]$/; // [cite: 37]

        if (!regex.test(trimmed)) {
            invalid_entries.push(str); // [cite: 38]
            return;
        }

        const [parent, child] = trimmed.split('->');

        if (parent === child) {
            invalid_entries.push(str); // [cite: 39]
            return;
        }

        if (seen_edges.has(trimmed)) {
            duplicate_edges.push(trimmed); // [cite: 42]
            return;
        }

        seen_edges.add(trimmed);

        // Multi-parent rule: first wins, subsequent discarded [cite: 51, 52]
        if (parent_map.has(child)) {
            return;
        }

        parent_map.set(child, parent);
        if (!children_map.has(parent)) children_map.set(parent, []);
        children_map.get(parent).push(child);

        all_nodes.add(parent);
        all_nodes.add(child);
        valid_edges.push({ parent, child });
    });

    // 2. Grouping nodes into independent connected components (DSU)
    const parentDSU = new Map();
    const find = (i) => {
        if (!parentDSU.has(i)) parentDSU.set(i, i);
        if (parentDSU.get(i) === i) return i;
        parentDSU.set(i, find(parentDSU.get(i)));
        return parentDSU.get(i);
    };

    const union = (i, j) => {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) parentDSU.set(rootI, rootJ);
    };

    all_nodes.forEach(node => find(node));
    valid_edges.forEach(({ parent, child }) => union(parent, child));

    const groups = new Map();
    all_nodes.forEach(node => {
        const root = find(node);
        if (!groups.has(root)) groups.set(root, []);
        groups.get(root).push(node);
    });

    // 3. Building Trees and Detecting Cycles
    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root = null;
    let max_overall_depth = 0;
    const hierarchies = [];

    groups.forEach((nodesInGroup) => {
        // Find roots (nodes with no parents) [cite: 47]
        let roots = nodesInGroup.filter(n => !parent_map.has(n));
        let root;

        if (roots.length === 0) {
            // Pure cycle, no root found. Pick lexicographically smallest. [cite: 50]
            nodesInGroup.sort();
            root = nodesInGroup[0];
        } else {
            root = roots[0];
        }

        let has_cycle = false;
        let max_depth = 0;
        const visited = new Set();
        const recursionStack = new Set();

        // DFS Tree Builder
        const dfs = (node, currentDepth) => {
            visited.add(node);
            recursionStack.add(node);
            max_depth = Math.max(max_depth, currentDepth);

            const treeObj = {};
            const children = children_map.get(node) || [];
            children.sort(); // Maintain alphabetical order

            for (const child of children) {
                if (!visited.has(child)) {
                    treeObj[child] = dfs(child, currentDepth + 1);
                } else if (recursionStack.has(child)) {
                    has_cycle = true; // Cycle detected
                } else {
                    treeObj[child] = {};
                }
            }
            recursionStack.delete(node);
            return treeObj;
        };

        const treeStructure = dfs(root, 1);
        const hierarchyObj = { root };

        if (has_cycle) {
            hierarchyObj.has_cycle = true; // [cite: 54]
            hierarchyObj.tree = {};
            total_cycles++; // [cite: 63]
        } else {
            hierarchyObj.tree = { [root]: treeStructure };
            hierarchyObj.depth = max_depth; // [cite: 58]
            total_trees++;

            // Tiebreaker for largest tree [cite: 62]
            if (max_depth > max_overall_depth) {
                max_overall_depth = max_depth;
                largest_tree_root = root;
            } else if (max_depth === max_overall_depth) {
                if (!largest_tree_root || root < largest_tree_root) {
                    largest_tree_root = root;
                }
            }
        }

        hierarchies.push(hierarchyObj);
    });

    // Sort hierarchies alphabetically by root to ensure consistent API response [cite: 83-107]
    hierarchies.sort((a, b) => a.root.localeCompare(b.root));

    return {
        hierarchies,
        invalid_entries,
        duplicate_edges,
        summary: {
            total_trees,
            total_cycles,
            largest_tree_root
        }
    };
};

module.exports = { processHierarchies };