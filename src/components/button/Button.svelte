<script lang="ts">
    import "./Button.css";

    let className: string;
    export { className as class };

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
