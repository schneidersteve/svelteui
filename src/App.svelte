<script lang="ts">
	import { sidebarActive } from "./store";

	import AppTopBar from "./AppTopBar.svelte";
	import AppMenu from "./AppMenu.svelte";

	import Home from "./showcase/Home.svelte";
	import ButtonDemo from "./showcase/button/ButtonDemo.svelte";
	import CheckboxDemo from "./showcase/checkbox/CheckboxDemo.svelte";
	import DataTableBasicDemo from "./showcase/datatable/DataTableBasicDemo.svelte";

	import Router from "svelte-spa-router";

	const routes = {
		'/': Home,
		'/button': ButtonDemo,
		'/checkbox': CheckboxDemo,
		'/basicdatatable': DataTableBasicDemo
	}

$:	if ($sidebarActive) addClass(document.body, "blocked-scroll");
	else removeClass(document.body, "blocked-scroll");

	function addClass(element, className) {
        if (element.classList)
            element.classList.add(className);
        else
            element.className += ' ' + className;
    }

    function removeClass(element, className) {
        if (element.classList)
            element.classList.remove(className);
        else
            element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
    }

	function onMaskClick() {
		sidebarActive.set(false);
	}
</script>

<div class="layout-wrapper">
	<AppTopBar/>
	<AppMenu/>
	<div class="layout-mask" class:layout-mask-active={$sidebarActive} on:click={onMaskClick}/>
	<div class="layout-content">
		<Router {routes}/>
	</div>
</div>
