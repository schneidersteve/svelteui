<script lang="ts">
    import type TreeNode from "../treenode/TreeNode";
    import type Column from "../column/Column";

    import TreeTableRow from "./TreeTableRow.svelte";

    export let value: ReadonlyArray<TreeNode>;
    export let columns: ReadonlyArray<Column>;
    export let expandedKeys: any;

    let empty: boolean;
 $: empty = !value || value.length === 0;
</script>

<tbody class="p-treetable-tbody">
    {#if !empty}
        {#each value as node, i}
            <TreeTableRow node={node} columns={columns} expandedKeys={expandedKeys} level={0} on:toogle on:expand on:collapse/>
        {/each}
    {:else}
    {/if}
</tbody>
