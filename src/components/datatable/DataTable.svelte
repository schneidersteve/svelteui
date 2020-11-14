<script lang="ts">
    import "./DataTable.css";

    import type Column from "../column/Column";

    import TableHeader from "./TableHeader.svelte";
    import TableBody from "./TableBody.svelte";
    import TableFooter from "./TableFooter.svelte";

    export let columns: ReadonlyArray<Column>;
    export let value: ReadonlyArray<any>;
    export let scrollable: boolean;

    let tableRef: any;
</script>

<div
    class:p-datatable={true}
    class:p-component={true}
    data-scrollselectors=".p-datatable-scrollable-body, .p-datatable-unfrozen-view .p-datatable-scrollable-body"
>
    {#if !scrollable}
        <div class="p-datatable-wrapper">
            <table bind:this={tableRef} role="grid">
                <TableHeader columns={columns}/>
                <TableBody value={value} columns={columns}/>
                <TableFooter/>
            </table>
        </div>
    {:else}
        <div class="p-datatable-scrollable-wrapper">
        </div>
    {/if}
</div>
