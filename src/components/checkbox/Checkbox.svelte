<script lang="ts">
    import "./Checkbox.css";

    export let className: string;
    export let id: string;
    export let disabled: boolean;
    export let name: string;
    export let value: any = "";

    export let checked: boolean = false;

    let inputRef: any;

    function onClick() {
        if (!disabled) {
            checked = !checked;
            inputRef.focus();
        }
    }
</script>

<div on:click={onClick}
    class="{className? className : ""}"
    class:p-checkbox={true}
    class:p-component={true}
    class:p-checkbox-checked={checked}
>
    <div class="p-hidden-accessible">
        <input bind:this={inputRef} type="checkbox" {disabled} bind:checked={checked} {id} name={name} value={value}/>
    </div>
    <div
        class:p-checkbox-box={true}
        class:p-highlight={checked}
        class:p-disabled={disabled}
        class:p-focus={false}
        role="checkbox"
        aria-checked={checked}
    >
         <span
             class:p-checkbox-icon={true}
             class:pi={checked}
             class:pi-check={checked}
         />
    </div>
</div>
