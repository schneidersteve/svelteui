<script lang="ts">
    import type Column from "../column/Column";

    import BodyCell from "./BodyCell.svelte";

    export let value: ReadonlyArray<any>;
    export let rowData: any;
    export let columns: ReadonlyArray<Column>;
</script>

<tr>
    {#each columns as col, i}
        <BodyCell rowData={rowData} column={col}/>
    {/each}
</tr>
