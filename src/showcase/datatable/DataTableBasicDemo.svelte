<script lang="ts">
    import type Column from "../../components/column/Column";

    import DataTable from "../../components/datatable/DataTable.svelte";

    import { ProductService } from "../../services/ProductService";

    let columns: Column[] = [
            {field: 'code', header: 'Code'},
            {field: 'name', header: 'Name'},
            {field: 'category', header: 'Category'},
            {field: 'quantity', header: 'Quantity'}
        ];

    let products: any[];
    new ProductService().getProductsSmall().then(data => products = data);
</script>

<div>
    <div class="content-section introduction">
        <div class="feature-intro">
            <h1>DataTable <span>Basic</span></h1>
            <p>DataTable requires a collection to display along with column components for the representation of the data.</p>
        </div>
    </div>

    <div class="content-section implementation">
        <div class="card">
            <DataTable columns={columns} value={products}/>
        </div>
    </div>
</div>
