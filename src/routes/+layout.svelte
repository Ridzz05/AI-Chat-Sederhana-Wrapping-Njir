<script lang="ts">
	import './layout.css';
	import { darkMode } from '$lib/stores/chat';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		const saved = localStorage.getItem('darkMode');
		if (saved !== null) {
			$darkMode = JSON.parse(saved);
		}
	});

	$effect(() => {
		if ($darkMode) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		localStorage.setItem('darkMode', JSON.stringify($darkMode));
	});
</script>

<svelte:head>
	<title>AI ChatKu — Intelligent AI Assistant</title>
</svelte:head>

<div class="h-screen w-screen overflow-hidden font-[Inter,sans-serif]">
	{@render children()}
</div>
