<script lang="ts">
	import AppTopBar from "./AppTopBar.svelte";
	import AppMenu from "./AppMenu.svelte";

	import ButtonDemo from "./showcase/button/ButtonDemo.svelte";
	import CheckboxDemo from "./showcase/checkbox/CheckboxDemo.svelte";

	import Router from "svelte-spa-router";

	const routes = {
		'/': ButtonDemo,
		'/button': ButtonDemo,
		'/checkbox': CheckboxDemo
	}

	let sidebarActive:boolean = false;

	function onMenuButtonClick() {
		if (sidebarActive) {
			sidebarActive = false;
			removeClass(document.body, "blocked-scroll");
		}
		else {
			sidebarActive = true;
			addClass(document.body, "blocked-scroll");
		}
	}

	function onMenuItemClick() {
		sidebarActive = false;
		removeClass(document.body, "blocked-scroll");
	}

	function onMaskClick() {
		sidebarActive = false;
		removeClass(document.body, "blocked-scroll");
	}

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
</script>

<div class="layout-wrapper">
	<AppTopBar on:click="{onMenuButtonClick}"/>
	<AppMenu isactive={sidebarActive} on:click={onMenuItemClick}/>
	<div class="layout-mask" class:layout-mask-active={sidebarActive} on:click={onMaskClick}/>
	<div class="layout-content">
		<Router {routes}/>
	</div>
</div>
