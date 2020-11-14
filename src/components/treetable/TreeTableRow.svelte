<script lang="ts">
    import { createEventDispatcher } from "svelte";

    import type TreeNode from "../treenode/TreeNode";
    import type Column from "../column/Column";

    import TreeTableBodyCell from "./TreeTableBodyCell.svelte";
import type { children } from "svelte/internal";
import App from "../../App.svelte";
import AppMenu from "../../AppMenu.svelte";

    export let node: TreeNode;
    export let columns: ReadonlyArray<Column>;
    export let expandedKeys: any;
    export let level: number;

    const dispatch = createEventDispatcher();

    let expanded: boolean;
$:  expanded = expandedKeys ? expandedKeys[node.key] !== undefined : false;

    let style: string;
$:  style = `margin-left: ${level * 16}px; visibility: ${(node.leaf === false || (node.children && node.children.length)) ? "visible" : "hidden"};`;

    function onTogglerClick() {
        if (expanded) {
            let ek = {...expandedKeys};
            delete ek[node.key];
            dispatch("toogle", ek);
            dispatch("expand", node);
            return;
        }
        let ek = expandedKeys ? {...expandedKeys} : {};
        ek[node.key] = true;
        dispatch("toogle", ek);
        dispatch("collapse", node);
    }
</script>

<tr>
    {#each columns as column, i}
        <TreeTableBodyCell key={column.columnKey||column.field} node={node} column={column}>
            {#if column.expander}
                <button type="button" on:click|preventDefault|stopPropagation={onTogglerClick} class="p-treetable-toggler p-link p-unselectable-text" tabindex="-1" style={style}>
                    <i
                        class:p-treetable-toggler-icon={true}
                        class:pi={true}
                        class:pi-fw={true}
                        class:pi-chevron-right={!expanded}
                        class:pi-chevron-down={expanded}
                    />
                </button>
            {/if}
        </TreeTableBodyCell>
    {/each}
</tr>
{#if expanded && node.children}
{#each node.children as childNode}
    <svelte:self node={childNode} columns={columns} expandedKeys={expandedKeys} level={level + 1} on:toogle on:expand on:collapse/>
{/each}
{/if}
