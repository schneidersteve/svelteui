<script lang="ts">
    import Checkbox from "../../components/checkbox/Checkbox.svelte";

    let checked: boolean = false;

    let categories = [{name: 'Accounting', key: 'A'}, {name: 'Marketing', key: 'M'}, {name: 'Production', key: 'P'}, {name: 'Research', key: 'R'}];
</script>

<div>
    <div class="content-section introduction">
        <div class="feature-intro">
            <h1>Checkbox</h1>
            <p>Checkbox is an extension to standard checkbox element with theming.</p>
        </div>
    </div>

    <div class="content-section implementation">
        <div class="card">
            <h5>Basic</h5>
            <div class="p-field-checkbox">
                 <Checkbox id="binary" bind:checked={checked} />
                <label for="binary">{checked}</label>
            </div>

            <h5>Multiple</h5>
            <div class="p-field-checkbox">
                <Checkbox id="city1" name="city" value="Chicago" />
                <label for="city1">Chicago</label>
            </div>
            <div class="p-field-checkbox">
                <Checkbox id="city2" name="city" value="Los Angeles" />
                <label for="city2">Los Angeles</label>
            </div>
            <div class="p-field-checkbox">
                <Checkbox id="city3" name="city" value="New York" />
                <label for="city3">New York</label>
            </div>
            <div class="p-field-checkbox">
                <Checkbox id="city4" name="city" value="San Francisco"/>
                <label for="city4">San Francisco</label>
            </div>

            <h5>Dynamic Values, Preselection, Value Binding and Disabled Option</h5>
            {#each categories as category}
                <div class="p-field-checkbox">
                    <Checkbox id={category.key} name="category" value={category} disabled={category.key === "R"} />
                    <label for={category.key}>{category.name}</label>
                </div>
            {/each}

        </div>
    </div>
</div>
