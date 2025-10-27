<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Whisper } from "./WhisperEngine";
  import type { ThemeStyle, AnimationConfig } from "./theme.config";

  export let whispers: Whisper[] = [];
  export let themes: Record<string, ThemeStyle> = {};
  export let animation: AnimationConfig;
  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let activeTab: "whispers" | "themes" | "animation" = "whispers";
  let editingIndex: number = -1;
  let editingWhisper: Whisper = { text: "", theme: "", weight: 1 };

  let editingThemeName: string = "";
  let editingThemeStyle: ThemeStyle | null = null;

  function addWhisper() {
    const newWhisper: Whisper = {
      text: "新的耳语...",
      theme: "void",
      weight: 2,
    };
    dispatch("addWhisper", newWhisper);
  }

  function startEdit(index: number) {
    editingIndex = index;
    editingWhisper = { ...whispers[index] };
  }

  function saveEdit() {
    if (editingIndex >= 0) {
      dispatch("updateWhisper", {
        index: editingIndex,
        whisper: editingWhisper,
      });
      cancelEdit();
    }
  }

  function cancelEdit() {
    editingIndex = -1;
    editingWhisper = { text: "", theme: "", weight: 1 };
  }

  function deleteWhisper(index: number) {
    if (confirm("确定删除这句耳语吗？")) {
      dispatch("deleteWhisper", index);
    }
  }

  function selectThemeToEdit(themeName: string) {
    editingThemeName = themeName;
    editingThemeStyle = { ...themes[themeName] };
  }

  function saveTheme() {
    if (editingThemeName && editingThemeStyle) {
      dispatch("updateTheme", {
        name: editingThemeName,
        style: editingThemeStyle,
      });
      editingThemeName = "";
      editingThemeStyle = null;
    }
  }

  function updateAnimation() {
    dispatch("updateAnimation", animation);
  }

  function close() {
    isOpen = false;
    cancelEdit();
  }

  function exportData() {
    const data = {
      whispers,
      themes,
      animation,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "whispering_void_config.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          dispatch("import", data);
        } catch (err) {
          alert("导入失败：文件格式错误");
        }
      };
      reader.readAsText(file);
    }
  }
</script>

{#if isOpen}
  <div class="editor-overlay" on:click={close}>
    <div class="editor-panel" on:click|stopPropagation>
      <div class="editor-header">
        <h2>虚空编辑器</h2>
        <button class="close-btn" on:click={close}>✕</button>
      </div>

      <div class="tabs">
        <button
          class:active={activeTab === "whispers"}
          on:click={() => (activeTab = "whispers")}
        >
          耳语句集
        </button>
        <button
          class:active={activeTab === "themes"}
          on:click={() => (activeTab = "themes")}
        >
          主题样式
        </button>
        <button
          class:active={activeTab === "animation"}
          on:click={() => (activeTab = "animation")}
        >
          动画参数
        </button>
      </div>

      <div class="editor-content">
        {#if activeTab === "whispers"}
          <div class="whispers-editor">
            <div class="actions">
              <button class="add-btn" on:click={addWhisper}>添加新句</button>
              <button class="export-btn" on:click={exportData}>导出配置</button>
              <label class="import-btn">
                导入配置
                <input
                  type="file"
                  accept=".json"
                  on:change={importData}
                  style="display: none;"
                />
              </label>
            </div>

            <div class="whispers-list">
              {#each whispers as whisper, i}
                <div class="whisper-item">
                  {#if editingIndex === i}
                    <div class="whisper-edit">
                      <input
                        bind:value={editingWhisper.text}
                        placeholder="句子内容"
                      />
                      <input
                        bind:value={editingWhisper.theme}
                        placeholder="主题"
                      />
                      <input
                        type="number"
                        bind:value={editingWhisper.weight}
                        min="1"
                        max="10"
                      />
                      <button on:click={saveEdit}>保存</button>
                      <button on:click={cancelEdit}>取消</button>
                    </div>
                  {:else}
                    <div class="whisper-display">
                      <div class="whisper-text">{whisper.text}</div>
                      <div class="whisper-meta">
                        <span class="theme-tag">{whisper.theme}</span>
                        <span class="weight">权重: {whisper.weight}</span>
                      </div>
                      <div class="whisper-actions">
                        <button on:click={() => startEdit(i)}>编辑</button>
                        <button on:click={() => deleteWhisper(i)}>删除</button>
                      </div>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {:else if activeTab === "themes"}
          <div class="themes-editor">
            <div class="themes-list">
              {#each Object.entries(themes) as [name, style]}
                <div
                  class="theme-item"
                  on:click={() => selectThemeToEdit(name)}
                >
                  <div
                    class="theme-preview"
                    style="background-color: {style.backgroundColor};"
                  >
                    <span style="color: {style.textColor};">{name}</span>
                  </div>
                </div>
              {/each}
            </div>

            {#if editingThemeStyle}
              <div class="theme-editor">
                <h3>编辑主题: {editingThemeName}</h3>
                <label>
                  背景色:
                  <input
                    type="color"
                    bind:value={editingThemeStyle.backgroundColor}
                  />
                  <input
                    type="text"
                    bind:value={editingThemeStyle.backgroundColor}
                  />
                </label>
                <label>
                  文字颜色:
                  <input type="text" bind:value={editingThemeStyle.textColor} />
                </label>
                <label>
                  字号:
                  <input type="text" bind:value={editingThemeStyle.fontSize} />
                </label>
                <label>
                  字间距:
                  <input
                    type="text"
                    bind:value={editingThemeStyle.letterSpacing}
                  />
                </label>
                <label>
                  行高:
                  <input
                    type="text"
                    bind:value={editingThemeStyle.lineHeight}
                  />
                </label>
                <label>
                  字重:
                  <input
                    type="number"
                    bind:value={editingThemeStyle.fontWeight}
                    min="100"
                    max="900"
                    step="100"
                  />
                </label>
                <button on:click={saveTheme}>保存主题</button>
              </div>
            {/if}
          </div>
        {:else if activeTab === "animation"}
          <div class="animation-editor">
            <label>
              淡入时长 (毫秒):
              <input
                type="number"
                bind:value={animation.fadeInDuration}
                min="100"
                max="5000"
                step="100"
              />
            </label>
            <label>
              淡出时长 (毫秒):
              <input
                type="number"
                bind:value={animation.fadeOutDuration}
                min="100"
                max="5000"
                step="100"
              />
            </label>
            <label>
              背景过渡时长 (毫秒):
              <input
                type="number"
                bind:value={animation.bgTransition}
                min="500"
                max="10000"
                step="500"
              />
            </label>
            <label>
              切换间隔 (毫秒):
              <input
                type="number"
                bind:value={animation.interval}
                min="1000"
                max="60000"
                step="1000"
              />
            </label>
            <button on:click={updateAnimation}>应用动画设置</button>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .editor-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(4px);
  }

  .editor-panel {
    background: #1e1e1e;
    border-radius: 12px;
    width: 50%;
    height: 75%;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.3rem 0.6rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .editor-header h2 {
    margin: 0;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.2rem;
    font-weight: 300;
    letter-spacing: 0.05em;
  }

  .close-btn {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.8);
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: rgba(255, 255, 255, 1);
  }

  .tabs {
    display: flex;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: 0.5rem 0;
    gap: 0.5rem;
  }

  .tabs button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    transition: all 0.2s;
    padding: 0.3rem 1.5rem;
  }

  .tabs button.active {
    color: rgba(255, 255, 255, 0.9);
  }

  .tabs button:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  .editor-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .actions {
    display: flex;
    gap: 1.2rem;
    margin-bottom: 1rem;
  }

  .actions button,
  .actions label {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .actions button:hover,
  .actions label:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .whispers-list {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 1rem;
  }

  .whisper-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.5rem;
  }

  .whisper-display {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .whisper-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 1rem;
  }

  .whisper-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
  }

  .theme-tag {
    background: rgba(100, 100, 255, 0.3);
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
    color: rgba(200, 200, 255, 0.9);
  }

  .weight {
    color: rgba(255, 255, 255, 0.5);
  }

  .whisper-actions {
    display: flex;
    gap: 0.3rem;
  }

  .whisper-actions button {
    background: none;
    color: rgba(255, 255, 255, 0.7);
    border-style: none;
    padding: 0.2rem;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .whisper-actions button:hover {
    color: rgba(255, 255, 255, 0.9);
  }

  .whisper-edit {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .whisper-edit input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
    padding: 0.5rem 0.2rem;
    border-radius: 4px;
    font-size: 0.9rem;
  }

  .whisper-edit button {
    font-size: 0.8rem;
    background: rgba(100, 150, 255, 0.3);
    border: 1px solid rgba(100, 150, 255, 0.5);
    color: rgba(255, 255, 255, 0.9);
    padding: 0.3rem 0.2rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .whisper-edit button:hover {
    background: rgba(100, 150, 255, 0.4);
  }

  .themes-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .theme-item {
    cursor: pointer;
    transition: transform 0.2s;
  }

  .theme-item:hover {
    transform: scale(1.05);
  }

  .theme-preview {
    padding: 2rem 1rem;
    border-radius: 8px;
    text-align: center;
    font-size: 0.9rem;
    border: 2px solid rgba(255, 255, 255, 0.1);
  }

  .theme-editor {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    padding: 0.5rem;
  }

  .theme-editor h3 {
    color: rgba(255, 255, 255, 0.9);
    margin-top: 0;
    font-weight: 300;
  }

  .theme-editor label,
  .animation-editor label {
    display: grid;
    grid-template-columns: 10rem 15rem 10rem;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .theme-editor input,
  .animation-editor input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.9);
    padding: 0.3rem;
    border-radius: 4px;
    font-size: 0.95rem;
  }

  .theme-editor button,
  .animation-editor button {
    background: rgba(100, 150, 255, 0.3);
    border: 1px solid rgba(100, 150, 255, 0.5);
    color: rgba(255, 255, 255, 0.9);
    padding: 0.3rem 0.6rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    margin-top: 0.5rem;
    transition: all 0.2s;
  }

  .theme-editor button:hover,
  .animation-editor button:hover {
    background: rgba(100, 150, 255, 0.4);
  }

  .animation-editor {
    max-width: 500px;
  }

  @media (max-width: 768px) {
    .editor-panel {
      width: 90%;
    }
    .whispers-list {
      grid-template-columns: minmax(0, 1fr);
    }

    .tabs {
      gap: 0;
    }

    .actions {
      gap: 1rem;
    }

    .theme-editor label,
    .animation-editor label {
      grid-template-columns: 1fr;
    }
  }
</style>
