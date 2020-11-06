<script lang="ts">
	import { sidebarActive } from "./store";
    import active from "svelte-spa-router/active"

	function onMenuItemClick() {
		sidebarActive.set(false);
	}
</script>

<div class="layout-sidebar" class:active={$sidebarActive}>
    <div class="layout-menu">
        <div class="menu-category">Button</div>
        <div class="menu-items">
            <a href="#/button" on:click={onMenuItemClick} use:active={{className: "router-link-active router-link-exact-active"}}>Button</a>
        </div>

        <div class="menu-category">Form</div>
        <div class="menu-items">
            <a href="#/checkbox" on:click={onMenuItemClick} use:active={{className: "router-link-active router-link-exact-active"}}>Checkbox</a>
        </div>
    </div>
</div>
