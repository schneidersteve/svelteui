<script lang="ts">
    import Checkbox from "../../components/checkbox/Checkbox.svelte";

    let checked: boolean = false;
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
            TBD

            <h5>Dynamic Values, Preselection, Value Binding and Disabled Option</h5>
            TBD
        </div>
    </div>
</div>
