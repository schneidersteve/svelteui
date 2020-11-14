<script lang="ts">
    import type Column from "../column/Column";

    export let rowData: any;
    export let column: Column;
</script>

<td>
    <span>{rowData[column.field]}</span>
</td>
