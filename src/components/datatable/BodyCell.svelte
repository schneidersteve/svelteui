<script lang="ts">
    import type Column from "../column/Column";

    export let rowData: any;
    export let column: Column;
</script>

<td>
    {rowData[column.field]}
</td>
