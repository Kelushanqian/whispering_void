<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { WhisperEngine, type Whisper } from "./lib/WhisperEngine";
  import {
    ThemeManager,
    defaultThemeConfig,
    type ThemeStyle,
    type AnimationConfig,
  } from "./lib/theme.config";
  import Editor from "./lib/Editor.svelte";
  import whispersData from "./data/whispers.json";

  let currentWhisper: Whisper | null = null;
  let engine: WhisperEngine;
  let themeManager: ThemeManager;
  let unsubscribe: (() => void) | null = null;
  let unsubscribeDataChange: (() => void) | null = null;
  let fadeIn = false;
  let isEditorOpen = false;

  // 响应式变量：用于触发编辑器更新
  let whispersList: Whisper[] = [];
  let themesList: Record<string, ThemeStyle> = {};

  let currentTheme: ThemeStyle = defaultThemeConfig.defaultTheme;
  let animationConfig: AnimationConfig = defaultThemeConfig.animation;

  onMount(() => {
    themeManager = new ThemeManager();
    animationConfig = themeManager.getAnimation();
    themesList = themeManager.getAllThemes();

    engine = new WhisperEngine(whispersData.whispers);
    whispersList = engine.getAll();

    // 订阅耳语更新
    unsubscribe = engine.subscribe((whisper) => {
      fadeIn = false;

      setTimeout(() => {
        currentWhisper = whisper;
        currentTheme = themeManager.getTheme(whisper.theme);
        fadeIn = true;
      }, animationConfig.fadeOutDuration);
    });

    // 订阅数据变更（新增）
    unsubscribeDataChange = engine.subscribeDataChange(() => {
      // 触发响应式更新
      whispersList = engine.getAll();
    });

    engine.start(animationConfig.interval);
  });

  onDestroy(() => {
    if (engine) {
      engine.stop();
    }
    if (unsubscribe) {
      unsubscribe();
    }
    if (unsubscribeDataChange) {
      unsubscribeDataChange();
    }
  });

  function handleAddWhisper(event: CustomEvent<Whisper>) {
    engine.addWhisper(event.detail);
  }

  function handleUpdateWhisper(
    event: CustomEvent<{ index: number; whisper: Whisper }>
  ) {
    engine.updateWhisper(event.detail.index, event.detail.whisper);
  }

  function handleDeleteWhisper(event: CustomEvent<number>) {
    engine.removeWhisper(event.detail);
  }

  function handleUpdateTheme(
    event: CustomEvent<{ name: string; style: ThemeStyle }>
  ) {
    themeManager.updateTheme(event.detail.name, event.detail.style);
    // 触发响应式更新
    themesList = themeManager.getAllThemes();

    if (currentWhisper && currentWhisper.theme === event.detail.name) {
      currentTheme = themeManager.getTheme(event.detail.name);
    }
  }

  function handleUpdateAnimation(event: CustomEvent<AnimationConfig>) {
    animationConfig = event.detail;
    themeManager.updateAnimation(event.detail);
    engine.stop();
    engine.start(animationConfig.interval);
  }

  function toggleEditor() {
    isEditorOpen = !isEditorOpen;
  }
</script>

<main
  style="background-color: {currentTheme.backgroundColor}; transition: background-color {animationConfig.bgTransition}ms ease;"
>
  {#if currentWhisper}
    <div
      class="whisper"
      class:fade-in={fadeIn}
      style="
        color: {currentTheme.textColor};
        font-size: {currentTheme.fontSize};
        letter-spacing: {currentTheme.letterSpacing};
        line-height: {currentTheme.lineHeight};
        font-weight: {currentTheme.fontWeight};
        transition: opacity {fadeIn
        ? animationConfig.fadeInDuration
        : animationConfig.fadeOutDuration}ms ease;
      "
    >
      {currentWhisper.text}
    </div>
  {/if}

  <button class="edit-dot" aria-label="编辑" on:click={toggleEditor}>
    <span class="dot"></span>
  </button>
</main>

<Editor
  bind:isOpen={isEditorOpen}
  whispers={whispersList}
  themes={themesList}
  bind:animation={animationConfig}
  on:addWhisper={handleAddWhisper}
  on:updateWhisper={handleUpdateWhisper}
  on:deleteWhisper={handleDeleteWhisper}
  on:updateTheme={handleUpdateTheme}
  on:updateAnimation={handleUpdateAnimation}
/>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC",
      sans-serif;
  }

  main {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .whisper {
    text-align: center;
    max-width: 100vw;
    opacity: 0;
  }

  .whisper.fade-in {
    opacity: 1;
  }

  .edit-dot {
    position: fixed;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 10px;
    opacity: 0.15;
    transition: opacity 0.3s ease;
  }

  .edit-dot:hover {
    opacity: 0.5;
  }

  .dot {
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
  }

  @media (max-width: 768px) {
    .whisper {
      transform: rotate(90deg);
      white-space: nowrap;
    }
  }
</style>
