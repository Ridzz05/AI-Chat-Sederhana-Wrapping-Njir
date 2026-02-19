<script lang="ts">
  import { Marked } from "marked";
  import { markedHighlight } from "marked-highlight";
  import hljs from "highlight.js";

  let {
    role,
    parts,
  }: { role: string; parts: Array<{ type: string; text?: string }> } = $props();

  // Configure marked with highlight.js
  const marked = new Marked(
    markedHighlight({
      langPrefix: "hljs language-",
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    }),
  );

  function getTextContent(): string {
    return parts
      .filter((p) => p.type === "text" && p.text)
      .map((p) => p.text)
      .join("");
  }

  function renderMarkdown(text: string): string {
    return marked.parse(text) as string;
  }

  let copied = $state(false);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  }
</script>

<div
  class="group flex gap-4 px-4 py-5 transition-colors {role === 'user'
    ? ''
    : 'bg-accent/30'}"
>
  <!-- Avatar -->
  <div class="shrink-0">
    {#if role === "user"}
      <div
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-600 to-zinc-700 text-xs font-bold text-white shadow-sm"
      >
        U
      </div>
    {:else}
      <div
        class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
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
    {/if}
  </div>

  <!-- Message Content -->
  <div class="min-w-0 flex-1">
    <div class="mb-1 flex items-center gap-2">
      <span
        class="text-xs font-semibold uppercase tracking-wider {role === 'user'
          ? 'text-foreground'
          : 'text-violet-400'}"
      >
        {role === "user" ? "You" : "AI ChatKu"}
      </span>
    </div>

    {#if role === "user"}
      <div class="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
        {getTextContent()}
      </div>
    {:else}
      <div class="prose-chat text-sm leading-relaxed text-foreground">
        {@html renderMarkdown(getTextContent())}
      </div>
      <!-- Copy button for AI messages -->
      {#if getTextContent().trim()}
        <div
          class="mt-2 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <button
            class="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onclick={() => copyToClipboard(getTextContent())}
          >
            {#if copied}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"><path d="M20 6 9 17l-5-5" /></svg
              >
              Copied!
            {:else}
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
                ><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
                  d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
                /></svg
              >
              Copy
            {/if}
          </button>
        </div>
      {/if}
    {/if}
  </div>
</div>
