<script lang="ts">
    import type Column from "../column/Column";

    export let columnGroup: any;
    export let columns: ReadonlyArray<Column>;
</script>

<thead class="p-datatable-thead">
    {#if !columnGroup}
        <tr>
            {#each columns as {field, header}, i}
                <th>
                    {#if header}
                        <span class="p-column-title">{header}</span>
                    {/if}
                </th>
            {/each}
        </tr>
    {:else}
    {/if}
</thead>
