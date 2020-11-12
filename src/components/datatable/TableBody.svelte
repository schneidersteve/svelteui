<script lang="ts">
    import type Column from "../column/Column";

    import BodyCell from "./BodyCell.svelte";

    export let value: any[];
    export let columns: ReadonlyArray<Column>;
    export let empty: boolean;
</script>

<tbody class="p-datatable-tbody">
    {#if !empty}
        {#each value as rowData, i}
            <tr>
                {#each columns as col, i}
                    <BodyCell rowData={rowData} column={col}/>
                {/each}
            </tr>
        {/each}
    {:else}
    {/if}
</tbody>
