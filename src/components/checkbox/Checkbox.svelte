<script lang="ts">
    import "./Checkbox.css";

    export let className: string;
    export let id: string;
    export let disabled: boolean;

    export let checked: boolean = false;
</script>

<div
    class="{className? className : ""}"
    class:p-checkbox={true}
    class:p-component={true}
    class:p-checkbox-checked={checked}
>
    <div class="p-hidden-accessible">
        <input type="checkbox" bind:checked={checked} {id}/>
    </div>
    <div
        class:p-checkbox-box={true}
        class:p-highlight={checked}
        role="checkbox"
    >
         <span
             class:p-checkbox-icon={true}
             class:pi={checked}
             class:pi-check={checked}
         />
    </div>
</div>
