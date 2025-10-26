<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { WhisperEngine, type Whisper } from './lib/WhisperEngine';
  import { ThemeManager, defaultThemeConfig, type ThemeStyle, type AnimationConfig } from './lib/theme.config';
  import Editor from './lib/Editor.svelte';
  import whispersData from './data/whispers.json';

  let currentWhisper: Whisper | null = null;
  let engine: WhisperEngine;
  let themeManager: ThemeManager;
  let unsubscribe: (() => void) | null = null;
  let fadeIn = false;
  let isEditorOpen = false;

  // 当前主题样式
  let currentTheme: ThemeStyle = defaultThemeConfig.defaultTheme;
  let animationConfig: AnimationConfig = defaultThemeConfig.animation;

  onMount(() => {
    // 初始化主题管理器
    themeManager = new ThemeManager();
    animationConfig = themeManager.getAnimation();

    // 初始化引擎
    engine = new WhisperEngine(whispersData.whispers);
    
    // 订阅更新
    unsubscribe = engine.subscribe((whisper) => {
      // 淡出
      fadeIn = false;
      
      // 等待淡出完成后更新内容并淡入
      setTimeout(() => {
        currentWhisper = whisper;
        currentTheme = themeManager.getTheme(whisper.theme);
        fadeIn = true;
      }, animationConfig.fadeOutDuration);
    });
    
    // 启动引擎
    engine.start(animationConfig.interval);
  });

  onDestroy(() => {
    if (engine) {
      engine.stop();
    }
    if (unsubscribe) {
      unsubscribe();
    }
  });

  // 编辑器事件处理
  function handleAddWhisper(event: CustomEvent<Whisper>) {
    engine.addWhisper(event.detail);
  }

  function handleUpdateWhisper(event: CustomEvent<{ index: number, whisper: Whisper }>) {
    engine.updateWhisper(event.detail.index, event.detail.whisper);
  }

  function handleDeleteWhisper(event: CustomEvent<number>) {
    engine.removeWhisper(event.detail);
  }

  function handleUpdateTheme(event: CustomEvent<{ name: string, style: ThemeStyle }>) {
    themeManager.updateTheme(event.detail.name, event.detail.style);
    // 如果当前正在显示这个主题，立即更新
    if (currentWhisper && currentWhisper.theme === event.detail.name) {
      currentTheme = themeManager.getTheme(event.detail.name);
    }
  }

  function handleUpdateAnimation(event: CustomEvent<AnimationConfig>) {
    animationConfig = event.detail;
    themeManager.updateAnimation(event.detail);
    // 重启引擎以应用新的间隔时间
    engine.stop();
    engine.start(animationConfig.interval);
  }

  function handleImport(event: CustomEvent<any>) {
    const data = event.detail;
    if (data.whispers) {
      // 清空现有句集并添加新的
      const currentWhispers = engine.getAll();
      currentWhispers.forEach((_, i) => engine.removeWhisper(0));
      data.whispers.forEach((w: Whisper) => engine.addWhisper(w));
    }
    if (data.themes) {
      // 更新主题
      Object.entries(data.themes).forEach(([name, style]) => {
        themeManager.updateTheme(name, style as ThemeStyle);
      });
    }
    if (data.animation) {
      animationConfig = data.animation;
      themeManager.updateAnimation(data.animation);
      engine.stop();
      engine.start(animationConfig.interval);
    }
  }

  function toggleEditor() {
    isEditorOpen = !isEditorOpen;
  }
</script>

<main style="background-color: {currentTheme.backgroundColor}; transition: background-color {animationConfig.bgTransition}ms ease;">
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
        transition: opacity {fadeIn ? animationConfig.fadeInDuration : animationConfig.fadeOutDuration}ms ease;
      "
    >
      {currentWhisper.text}
    </div>
  {/if}
  
  <!-- 隐藏的编辑入口：右上角微弱圆点 -->
  <button class="edit-dot" aria-label="编辑" on:click={toggleEditor}>
    <span class="dot"></span>
  </button>
</main>

<Editor 
  bind:isOpen={isEditorOpen}
  whispers={engine ? engine.getAll() : []}
  themes={themeManager ? themeManager.getAllThemes() : {}}
  bind:animation={animationConfig}
  on:addWhisper={handleAddWhisper}
  on:updateWhisper={handleUpdateWhisper}
  on:deleteWhisper={handleDeleteWhisper}
  on:updateTheme={handleUpdateTheme}
  on:updateAnimation={handleUpdateAnimation}
  on:import={handleImport}
/>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif;
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
    padding: 2rem;
    max-width: 80%;
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
</style>