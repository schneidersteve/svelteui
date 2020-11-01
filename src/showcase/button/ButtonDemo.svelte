<script lang="ts">
    export let count: number = 0;

    export let doubled: number = 0;
    $: doubled = count * 2;

    function handleClick(): void {
        count += 1;
    }
</script>
   
<button on:click={handleClick}>
    Clicked {count} {count === 1 ? 'time' : 'times'}
</button>
