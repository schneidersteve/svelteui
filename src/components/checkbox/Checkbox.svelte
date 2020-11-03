<script lang="ts">
    export let className: string;
    export let id: string;
    export let disabled: boolean;

    export let checked: boolean = false;
</script>

<div
    class="{className? className : ""}"
    class:p-checkbox={true}
    class:p-component={true}
>
    <div class="p-hidden-accessible">
        <input type="checkbox" bind:checked={checked} {id}/>
    </div>
<!--      <div ref="box" :class="['p-checkbox-box', {'p-highlight': checked, 'p-disabled': $attrs.disabled, 'p-focus': focused}]" role="checkbox" :aria-checked="checked">
         <span :class="['p-checkbox-icon', {'pi pi-check': checked}]"></span>
     </div>
 --></div>

 <style>
.p-checkbox {
    display: inline-flex;
    cursor: pointer;
    user-select: none;
    vertical-align: bottom;
}

.p-checkbox-box {
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
