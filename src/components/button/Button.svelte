<script lang="ts">
    export let className: string;
    export let disabled: boolean;

    export let label: string;
    export let icon: string;
    export let iconPos: string = "left";
    export let badge: string;
    export let badgeClass: string;
</script>

<button on:click {disabled}
    class="{className? className : ""}"
    class:p-button={true}
    class:p-component={true}
    class:p-button-icon-only={icon && !label}
    class:p-button-vertical={(iconPos === "top" || iconPos === "bottom") && label}
    class:p-disabled={disabled}
>
    {#if icon}
        <span
            class={icon}
            class:p-button-icon={true}
            class:p-button-icon-left={iconPos === "left" && label}
            class:p-button-icon-right={iconPos === "right" && label}
            class:p-button-icon-top={iconPos === "top" && label}
            class:p-button-icon-bottom={iconPos === "bottom" && label}
        />
    {/if}
    {#if label}
        <span class="p-button-label">{label}</span>
    {:else}
        <span class="p-button-label">{@html "&nbsp;"}</span>
    {/if}
    {#if badge}
        <span
            class:p-badge={true}
            class={badgeClass? badgeClass : ""}
        >{badge}</span>
    {/if}
</button>

<style>
.p-button {
    margin: 0;
    display: inline-flex;
    cursor: pointer;
    user-select: none;
    align-items: center;
    vertical-align: bottom;
    text-align: center;
    overflow: hidden;
    position: relative;
}

.p-button-label {
    flex: 1 1 auto;
}

.p-button-icon-right {
    order: 1;
}

.p-button:disabled {
    cursor: default;
}

.p-button-icon-only {
    justify-content: center;
}

.p-button-icon-only .p-button-label {
    visibility: hidden;
    width: 0;
    flex: 0 0 auto;
}

.p-button-vertical {
    flex-direction: column;
}

.p-button-icon-bottom {
    order: 2;
}

.p-buttonset .p-button {
    margin: 0;
}

.p-buttonset .p-button:not(:last-child) {
    border-right: 0 none;
}

.p-buttonset .p-button:not(:first-of-type):not(:last-of-type) {
    border-radius: 0;
}

.p-buttonset .p-button:first-of-type {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.p-buttonset .p-button:last-of-type {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.p-buttonset .p-button:focus {
    position: relative;
    z-index: 1;
}
</style>