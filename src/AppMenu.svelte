<script lang="ts">
    import active from "svelte-spa-router/active"

    export let isactive:boolean = false;
</script>

<div class="layout-sidebar" class:active={isactive}>
    <div class="layout-menu">
        <div class="menu-category">Button</div>
        <div class="menu-items">
            <a href="#/button" on:click use:active={{className: "router-link-active router-link-exact-active"}}>Button</a>
        </div>

        <div class="menu-category">Form</div>
        <div class="menu-items">
            <a href="#/checkbox" on:click use:active={{className: "router-link-active router-link-exact-active"}}>Checkbox</a>
        </div>
    </div>
</div>
