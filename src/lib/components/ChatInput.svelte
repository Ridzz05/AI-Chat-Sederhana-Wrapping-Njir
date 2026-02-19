<script lang="ts">
  let {
    value = $bindable(""),
    onSubmit,
    isLoading = false,
  }: {
    value: string;
    onSubmit: () => void;
    isLoading: boolean;
  } = $props();

  let textareaEl: HTMLTextAreaElement | undefined = $state();

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  }

  function autoResize() {
    if (textareaEl) {
      textareaEl.style.height = "auto";
      textareaEl.style.height = Math.min(textareaEl.scrollHeight, 200) + "px";
    }
  }

  $effect(() => {
    // Reset height when value is cleared
    if (!value && textareaEl) {
      textareaEl.style.height = "auto";
    }
  });
</script>

<div class="border-t border-border/50 bg-background/80 backdrop-blur-xl">
  <div class="mx-auto max-w-3xl px-4 py-4">
    <div
      class="flex items-end gap-2 rounded-2xl border border-border/50 bg-card/50 px-4 py-3 shadow-lg shadow-black/5 transition-all duration-200 focus-within:border-violet-500/30 focus-within:shadow-violet-500/5"
    >
      <textarea
        bind:this={textareaEl}
        bind:value
        onkeydown={handleKeydown}
        oninput={autoResize}
        placeholder="Type your message..."
        disabled={isLoading}
        rows="1"
        class="max-h-[200px] min-h-[24px] flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none disabled:opacity-50"
      ></textarea>

      <button
        onclick={onSubmit}
        disabled={isLoading || !value.trim()}
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25 transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/30 disabled:opacity-30 disabled:shadow-none"
      >
        {#if isLoading}
          <div
            class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
          ></div>
        {:else}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path d="m5 12 7-7 7 7" /><path d="M12 19V5" /></svg
          >
        {/if}
      </button>
    </div>
    <p class="mt-2 text-center text-[10px] text-muted-foreground/50">
      AI ChatKu can make mistakes. Verify important information.
    </p>
  </div>
</div>
