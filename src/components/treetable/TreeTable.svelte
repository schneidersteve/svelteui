<script lang="ts">
    import "./TreeTable.css";

    import type TreeNode from "../treenode/TreeNode";
    import type Column from "../column/Column";

    import TreeTableHeader from "./TreeTableHeader.svelte";
    import TreeTableBody from "./TreeTableBody.svelte";

    export let value: ReadonlyArray<TreeNode>;
    export let columns: ReadonlyArray<Column>;
    export let expandedKeys: any;

    let tableRef: any;

    function onToogle(event) {
        expandedKeys = event.detail;
    }
</script>

<div
    class:p-treetable={true}
    class:p-component={true}
    data-scrollselectors=".p-treetable-scrollable-body">
    <div class="p-treetable-wrapper">
        <table bind:this={tableRef}>
            <TreeTableHeader columns={columns}/>
            <TreeTableBody value={value} columns={columns} expandedKeys={expandedKeys} on:toogle={onToogle} on:expand on:collapse/>
        </table>
    </div>
</div>
