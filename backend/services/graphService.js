const processHierarchies = (data) => {
    const invalid_entries = [];
    const duplicate_edges = [];
    const valid_edges = [];
    const seen_edges = new Set();
    const parent_map = new Map();
    const children_map = new Map();
    const all_nodes = new Set();

    data.forEach(item => {
        const str = typeof item === 'string' ? item : "";
        const trimmed = str.trim();
        const regex = /^[A-Z]->[A-Z]$/;

        if (!regex.test(trimmed)) {
            invalid_entries.push(str);
            return;
        }

        const [parent, child] = trimmed.split('->');

        if (parent === child) {
            invalid_entries.push(str);
            return;
        }

        if (seen_edges.has(trimmed)) {
            duplicate_edges.push(trimmed);
            return;
        }

        seen_edges.add(trimmed);


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


    let total_trees = 0;
    let total_cycles = 0;
    let largest_tree_root = null;
    let max_overall_depth = 0;
    const hierarchies = [];

    groups.forEach((nodesInGroup) => {

        let roots = nodesInGroup.filter(n => !parent_map.has(n));
        let root;

        if (roots.length === 0) {

            nodesInGroup.sort();
            root = nodesInGroup[0];
        } else {
            root = roots[0];
        }

        let has_cycle = false;
        let max_depth = 0;
        const visited = new Set();
        const recursionStack = new Set();


        const dfs = (node, currentDepth) => {
            visited.add(node);
            recursionStack.add(node);
            max_depth = Math.max(max_depth, currentDepth);

            const treeObj = {};
            const children = children_map.get(node) || [];
            children.sort();

            for (const child of children) {
                if (!visited.has(child)) {
                    treeObj[child] = dfs(child, currentDepth + 1);
                } else if (recursionStack.has(child)) {
                    has_cycle = true;
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
            hierarchyObj.has_cycle = true;
            hierarchyObj.tree = {};
            total_cycles++;
        } else {
            hierarchyObj.tree = { [root]: treeStructure };
            hierarchyObj.depth = max_depth;
            total_trees++;


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