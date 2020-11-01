<script lang="ts">
import ButtonDemo from "./showcase/button/ButtonDemo.svelte";

let currCount: number = 0;
let currDoubled: number = 0;

$: if (currCount >= 3) {
		alert(`count is dangerously high!`);
	}
</script>

<main>
	<ButtonDemo bind:count={currCount} bind:doubled={currDoubled}></ButtonDemo>
	<p>{currCount} doubled is {currDoubled}</p>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}
</style>
