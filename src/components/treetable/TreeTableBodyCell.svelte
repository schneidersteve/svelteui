<script lang="ts">
    import type TreeNode from "../treenode/TreeNode";
    import type Column from "../column/Column";

    export let key: string;
    export let node: TreeNode;
    export let column: Column;
</script>

<td>
    <slot></slot>
    <span>{node.data[column.field]}</span>
</td>
