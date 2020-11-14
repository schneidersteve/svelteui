<script lang="ts">
    import { onMount } from "svelte";

    import type Column from "../../components/column/Column";

    import TreeTable from "../../components/treetable/TreeTable.svelte";

    import { NodeService } from "../../services/NodeService";

    let columns: Column[] = [
            {field: 'name', header: 'Name', expander: true},
            {field: 'size', header: 'Size'},
            {field: 'type', header: 'Type'}
        ];

    let nodes: any[];

    onMount(async () => {
        new NodeService().getTreeTableNodes().then(data => nodes = data);
    });
</script>

<div>
    <div class="content-section introduction">
        <div class="feature-intro">
            <h1>TreeTable <span>Basic</span></h1>
            <p>TreeTable is used to display hierarchical data in tabular format.</p>
        </div>
    </div>

    <div class="content-section implementation">
        <div class="card">
            <TreeTable columns={columns} value={nodes}/>
        </div>
    </div>
</div>
