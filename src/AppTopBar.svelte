<script lang="ts">
	import { sidebarActive } from "./store";

    function onMenuButtonClick() {
        sidebarActive.update(value => !value);
    }
</script>

<div class="layout-topbar">
    <a class="menu-button" on:click={onMenuButtonClick}>
        <i class="pi pi-bars"/>
    </a>
    <a href="#/"><img alt="Home" src="favicon.png" style="width: 50px;"/></a>
</div>
