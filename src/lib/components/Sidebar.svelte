<script lang="ts">
  import {
    MODELS,
    selectedModel,
    sidebarOpen,
    darkMode,
    type ChatSession,
    chatSessions,
    activeChatId,
    generateId,
  } from "$lib/stores/chat";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

  let {
    onNewChat,
    onSelectChat,
  }: { onNewChat: () => void; onSelectChat: (id: string) => void } = $props();

  function handleNewChat() {
    onNewChat();
    if (window.innerWidth < 768) {
      $sidebarOpen = false;
    }
  }

  function handleSelectChat(id: string) {
    onSelectChat(id);
    if (window.innerWidth < 768) {
      $sidebarOpen = false;
    }
  }

  function deleteChat(e: Event, id: string) {
    e.stopPropagation();
    $chatSessions = $chatSessions.filter((c) => c.id !== id);
    localStorage.setItem("chatSessions", JSON.stringify($chatSessions));
    if ($activeChatId === id) {
      $activeChatId = null;
      onNewChat();
    }
  }

  function getProviderIcon(provider: string): string {
    return provider === "google" ? "✦" : "◆";
  }

  function getProviderColor(provider: string): string {
    return provider === "google" ? "text-blue-400" : "text-emerald-400";
  }
</script>

<!-- Mobile Overlay -->
{#if $sidebarOpen}
  <button
    class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
    onclick={() => ($sidebarOpen = false)}
    aria-label="Close sidebar"
  ></button>
{/if}

<!-- Sidebar -->
<aside
  class="fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-border/50 bg-sidebar transition-transform duration-300 ease-in-out md:relative md:translate-x-0
	{$sidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
>
  <!-- Header -->
  <div class="flex items-center gap-3 p-4">
    <div
      class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        ><path d="M12 8V4H8" /><rect
          width="16"
          height="12"
          x="4"
          y="8"
          rx="2"
        /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path
          d="M9 13v2"
        /></svg
      >
    </div>
    <div>
      <h1 class="text-base font-bold tracking-tight text-foreground">
        AI ChatKu
      </h1>
      <p
        class="text-[10px] font-medium uppercase tracking-widest text-muted-foreground"
      >
        Intelligent Assistant
      </p>
    </div>
  </div>

  <!-- New Chat Button -->
  <div class="px-3 pb-2">
    <Button
      class="w-full justify-start gap-2 rounded-xl border border-border/50 bg-transparent text-sm font-medium text-foreground hover:bg-accent transition-all duration-200"
      variant="outline"
      onclick={handleNewChat}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"><path d="M12 5v14" /><path d="M5 12h14" /></svg
      >
      New Chat
    </Button>
  </div>

  <!-- Model Selector -->
  <div class="px-3 pb-3">
    <label
      for="model-select"
      class="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
    >
      Model
    </label>
    <select
      id="model-select"
      class="w-full rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30"
      bind:value={$selectedModel}
      aria-label="Select AI Model"
    >
      {#each MODELS as model}
        <option value={model.id}>
          {model.provider === "google" ? "✦" : "◆"}
          {model.name}
        </option>
      {/each}
    </select>
  </div>

  <Separator class="opacity-50" />

  <!-- Chat History -->
  <div class="flex-1 overflow-hidden">
    <div class="px-3 py-2">
      <span
        class="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
        >History</span
      >
    </div>
    <ScrollArea class="h-[calc(100%-2rem)] px-2">
      {#if $chatSessions.length === 0}
        <div class="flex flex-col items-center justify-center p-6 text-center">
          <div class="mb-2 text-2xl opacity-30">💬</div>
          <p class="text-xs text-muted-foreground">No conversations yet</p>
        </div>
      {:else}
        <div class="flex flex-col gap-0.5 pb-4">
          {#each $chatSessions as session (session.id)}
            <button
              class="group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-150
							{$activeChatId === session.id
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}"
              onclick={() => handleSelectChat(session.id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="shrink-0 opacity-50"
                ><path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                /></svg
              >
              <span class="flex-1 truncate text-[13px]">{session.title}</span>
              <div
                role="button"
                tabindex="0"
                class="shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-destructive/20 hover:text-destructive group-hover:opacity-100"
                onclick={(e) => deleteChat(e, session.id)}
                onkeydown={(e) =>
                  e.key === "Enter" && deleteChat(e, session.id)}
                aria-label="Delete chat"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><path d="M3 6h18" /><path
                    d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"
                  /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg
                >
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </ScrollArea>
  </div>

  <Separator class="opacity-50" />

  <!-- Footer -->
  <div class="p-3">
    <button
      class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      onclick={() => ($darkMode = !$darkMode)}
    >
      {#if $darkMode}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path
            d="M12 20v2"
          /><path d="m4.93 4.93 1.41 1.41" /><path
            d="m17.66 17.66 1.41 1.41"
          /><path d="M2 12h2" /><path d="M20 12h2" /><path
            d="m6.34 17.66-1.41 1.41"
          /><path d="m19.07 4.93-1.41 1.41" /></svg
        >
        <span>Light Mode</span>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg
        >
        <span>Dark Mode</span>
      {/if}
    </button>
  </div>
</aside>
