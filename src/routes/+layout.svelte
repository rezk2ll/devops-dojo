<script>
	import './layout.css';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { restore } from '#lib/progress.svelte.js';
	import { theme, initTheme, toggleTheme } from '#lib/theme.svelte.js';
	import { focus, initFocus } from '#lib/focus.svelte.js';
	import { initLang, toggleLang, t } from '#lib/i18n.svelte.js';
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import Cube from '#lib/components/cube.svelte';
	import Moon from '@lucide/svelte/icons/moon';
	import Sun from '@lucide/svelte/icons/sun';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	onMount(() => {
		restore();
		initTheme();
		initFocus();
		initLang();
	});
</script>

<svelte:head>
	<title>DevOps Dojo</title>
	<meta name="description" content={t().description} />
</svelte:head>

<header class="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 sm:px-8" hidden={focus.on && page.route.id === '/c/[slug]'}>
	<a href={resolve('/')} aria-label="DevOps Dojo" class="flex items-center gap-2 font-mono font-bold">
		<Cube state="done" class="size-6" /><span class="hidden min-[420px]:inline">devops<span class="text-brand">/</span>dojo</span>
	</a>
	<div class="flex items-center gap-1">
		<Button variant="ghost" size="sm" href={resolve('/review')}>{t().review}</Button>
		<Button variant="ghost" size="sm" href={resolve('/glossary')}>{t().glossary}</Button>
		<Button variant="ghost" size="icon-sm" class="font-mono text-xs" aria-label={t().toOtherLang} title={t().toOtherLang} onclick={toggleLang}>
			{t().otherLang}
		</Button>
		<Button
			variant="ghost"
			size="icon-sm"
			aria-label={theme.dark ? t().toLight : t().toDark}
			onclick={toggleTheme}
		>
			{#if theme.dark}<Sun />{:else}<Moon />{/if}
		</Button>
	</div>
</header>

<main class="mx-auto max-w-screen-2xl px-4 pb-10 sm:px-8">
	{@render children()}
</main>
