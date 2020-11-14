<script lang="ts">
    import type Column from "../column/Column";

    export let columns: ReadonlyArray<Column>;
</script>

<thead class="p-treetable-thead">
    <tr>
        {#each columns as {field, header}, i}
            <th>
                {#if header}
                    <span class="p-column-title">{header}</span>
                {/if}
            </th>
        {/each}
    </tr>
</thead>
