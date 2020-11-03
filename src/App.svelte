<script lang="ts">
	import AppMenu from "./AppMenu.svelte";
	import ButtonDemo from "./showcase/button/ButtonDemo.svelte";
	import CheckboxDemo from "./showcase/checkbox/CheckboxDemo.svelte";

	import Router from "svelte-spa-router";

	const routes = {
		'/': ButtonDemo,
		'/button': ButtonDemo,
		'/checkbox': CheckboxDemo
	}
</script>

<div class="layout-wrapper">
	<AppMenu/>
	<div class="layout-content">
		<Router {routes}/>
	</div>
</div>
