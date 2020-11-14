<script lang="ts">
    import type Column from "../column/Column";

    import BodyRow from "./BodyRow.svelte";

    export let value: ReadonlyArray<any>;
    export let columns: ReadonlyArray<Column>;

    let empty: boolean;
 $: empty = !value || value.length === 0;
</script>

<tbody class="p-datatable-tbody">
    {#if !empty}
        {#each value as rowData, i}
            <BodyRow value={value} rowData={rowData} columns={columns}/>
        {/each}
    {:else}
    {/if}
</tbody>
