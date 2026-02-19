<script lang="ts">
  import { Chat } from "@ai-sdk/svelte";
  import { onMount, tick } from "svelte";
  import ChatMessage from "$lib/components/ChatMessage.svelte";
  import ChatInput from "$lib/components/ChatInput.svelte";
  import Sidebar from "$lib/components/Sidebar.svelte";
  import {
    selectedModel,
    sidebarOpen,
    chatSessions,
    activeChatId,
    generateId,
  } from "$lib/stores/chat";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";

  let input = $state("");
  let messagesEndEl: HTMLDivElement | undefined = $state();
  let chatContainerEl: HTMLDivElement | undefined = $state();

  // @ts-ignore - ChatInit types seem to be missing api/body in this version, but runtime likely supports it via AbstractChat
  const chat = new Chat({
    api: "/api/chat",
    body: () => ({ model: $selectedModel }),
    onFinish: () => {
      // Save chat session when AI finishes responding
      saveChatSession();
    },
  } as any);

  function saveChatSession() {
    if (chat.messages.length === 0) return;

    const firstUserMsg = chat.messages.find((m) => m.role === "user");
    const title =
      firstUserMsg?.parts?.find((p) => p.type === "text")?.text?.slice(0, 50) ||
      "New Chat";

    if (!$activeChatId) {
      const id = generateId();
      $activeChatId = id;
      const session = { id, title, createdAt: Date.now() };
      $chatSessions = [session, ...$chatSessions];
    } else {
      // Update title if needed
      $chatSessions = $chatSessions.map((s) =>
        s.id === $activeChatId ? { ...s, title } : s,
      );
    }

    localStorage.setItem("chatSessions", JSON.stringify($chatSessions));
    // Save messages for this chat
    localStorage.setItem(
      `chat_${$activeChatId}`,
      JSON.stringify(chat.messages),
    );
  }

  function handleSubmit() {
    if (!input.trim() || chat.status === "streaming") return;
    chat.sendMessage({ text: input });
    input = "";
    scrollToBottom();
  }

  function handleNewChat() {
    $activeChatId = null;
    chat.messages = [];
    input = "";
  }

  function handleSelectChat(id: string) {
    $activeChatId = id;
    const saved = localStorage.getItem(`chat_${id}`);
    if (saved) {
      try {
        const messages = JSON.parse(saved);
        chat.messages = messages;
      } catch {
        chat.messages = [];
      }
    } else {
      chat.messages = [];
    }
  }

  async function scrollToBottom() {
    await tick();
    if (messagesEndEl) {
      messagesEndEl.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Auto-scroll when new messages arrive
  $effect(() => {
    if (chat.messages.length > 0) {
      scrollToBottom();
    }
  });

  onMount(() => {
    // Load chat sessions from localStorage
    const saved = localStorage.getItem("chatSessions");
    if (saved) {
      try {
        $chatSessions = JSON.parse(saved);
      } catch {
        // ignore
      }
    }
  });
</script>

<div class="flex h-full bg-background">
  <!-- Sidebar -->
  <Sidebar onNewChat={handleNewChat} onSelectChat={handleSelectChat} />

  <!-- Main Chat Area -->
  <div class="flex flex-1 flex-col overflow-hidden">
    <!-- Top Bar -->
    <header
      class="flex items-center gap-3 border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-xl"
    >
      <button
        class="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
        onclick={() => ($sidebarOpen = !$sidebarOpen)}
        aria-label="Toggle sidebar"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><line x1="4" x2="20" y1="12" y2="12" /><line
            x1="4"
            x2="20"
            y1="6"
            y2="6"
          /><line x1="4" x2="20" y1="18" y2="18" /></svg
        >
      </button>

      <div class="flex items-center gap-2">
        <div
          class="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 md:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><path d="M12 8V4H8" /><rect
              width="16"
              height="12"
              x="4"
              y="8"
              rx="2"
            /><path d="M2 14h2" /><path d="M20 14h2" /><path
              d="M15 13v2"
            /><path d="M9 13v2" /></svg
          >
        </div>
        <h2 class="text-sm font-semibold text-foreground">
          {$activeChatId ? "Chat" : "New Chat"}
        </h2>
      </div>

      <div class="ml-auto flex items-center gap-2">
        <span
          class="rounded-full bg-accent px-2.5 py-1 text-[10px] font-medium text-muted-foreground"
        >
          {$selectedModel}
        </span>
        {#if chat.status === "streaming"}
          <div class="flex items-center gap-1.5 text-[11px] text-violet-400">
            <div
              class="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400"
            ></div>
            Generating...
          </div>
        {/if}
      </div>
    </header>

    <!-- Messages Area -->
    <div class="flex-1 overflow-y-auto" bind:this={chatContainerEl}>
      {#if chat.messages.length === 0}
        <!-- Welcome Screen -->
        <div class="flex h-full flex-col items-center justify-center p-6">
          <div
            class="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/25"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              ><path d="M12 8V4H8" /><rect
                width="16"
                height="12"
                x="4"
                y="8"
                rx="2"
              /><path d="M2 14h2" /><path d="M20 14h2" /><path
                d="M15 13v2"
              /><path d="M9 13v2" /></svg
            >
          </div>
          <h2 class="mb-2 text-2xl font-bold text-foreground">
            Welcome to AI ChatKu
          </h2>
          <p class="mb-8 max-w-md text-center text-sm text-muted-foreground">
            Your intelligent AI assistant powered by Google Gemini and OpenAI
            GPT. Start a conversation below!
          </p>

          <!-- Quick Suggestions -->
          <div class="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              class="rounded-xl border border-border/50 bg-card/50 p-3.5 text-left text-sm transition-all duration-200 hover:border-violet-500/30 hover:bg-accent/50"
              onclick={() => {
                input = "Explain how AI works in simple terms";
                handleSubmit();
              }}
            >
              <div class="mb-1 text-xs font-semibold text-violet-400">
                ✦ Learn
              </div>
              <div class="text-muted-foreground">
                Explain how AI works in simple terms
              </div>
            </button>
            <button
              class="rounded-xl border border-border/50 bg-card/50 p-3.5 text-left text-sm transition-all duration-200 hover:border-violet-500/30 hover:bg-accent/50"
              onclick={() => {
                input = "Write a Python function to sort a list";
                handleSubmit();
              }}
            >
              <div class="mb-1 text-xs font-semibold text-emerald-400">
                ◆ Code
              </div>
              <div class="text-muted-foreground">
                Write a Python function to sort a list
              </div>
            </button>
            <button
              class="rounded-xl border border-border/50 bg-card/50 p-3.5 text-left text-sm transition-all duration-200 hover:border-violet-500/30 hover:bg-accent/50"
              onclick={() => {
                input = "Help me write a professional email";
                handleSubmit();
              }}
            >
              <div class="mb-1 text-xs font-semibold text-amber-400">
                ★ Write
              </div>
              <div class="text-muted-foreground">
                Help me write a professional email
              </div>
            </button>
            <button
              class="rounded-xl border border-border/50 bg-card/50 p-3.5 text-left text-sm transition-all duration-200 hover:border-violet-500/30 hover:bg-accent/50"
              onclick={() => {
                input = "What are the latest trends in web development?";
                handleSubmit();
              }}
            >
              <div class="mb-1 text-xs font-semibold text-blue-400">
                ◇ Explore
              </div>
              <div class="text-muted-foreground">
                Latest trends in web development?
              </div>
            </button>
          </div>
        </div>
      {:else}
        <!-- Chat Messages -->
        <div class="mx-auto max-w-3xl">
          {#each chat.messages as message, i (i)}
            <ChatMessage role={message.role} parts={message.parts} />
          {/each}

          {#if chat.status === "streaming" && chat.messages.length > 0}
            {@const lastMsg = chat.messages[chat.messages.length - 1]}
            {#if lastMsg.role === "user"}
              <!-- Thinking indicator -->
              <div class="flex gap-4 px-4 py-5 bg-accent/30">
                <div
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
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
                    /><path d="M2 14h2" /><path d="M20 14h2" /><path
                      d="M15 13v2"
                    /><path d="M9 13v2" /></svg
                  >
                </div>
                <div class="flex items-center gap-1.5 pt-1">
                  <div
                    class="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:0ms]"
                  ></div>
                  <div
                    class="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:150ms]"
                  ></div>
                  <div
                    class="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:300ms]"
                  ></div>
                </div>
              </div>
            {/if}
          {/if}
        </div>
        <div bind:this={messagesEndEl}></div>
      {/if}
    </div>

    <!-- Chat Input -->
    <ChatInput
      bind:value={input}
      onSubmit={handleSubmit}
      isLoading={chat.status === "streaming"}
    />
  </div>
</div>
