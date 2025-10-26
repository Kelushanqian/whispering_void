// src/lib/WhisperEngine.ts

export interface Whisper {
  text: string;
  theme: string;
  weight: number;
}

export class WhisperEngine {
  private whispers: Whisper[] = [];
  private currentWhisper: Whisper | null = null;
  private previousWhisper: Whisper | null = null;
  private intervalId: number | null = null;
  private listeners: Set<(whisper: Whisper) => void> = new Set();

  constructor(whispers: Whisper[]) {
    this.whispers = whispers;
  }

  // 根据权重随机选择一句，确保与上一句不同
  private selectRandomWhisper(): Whisper {
    // 获取当前主题
    const currentTheme = this.currentWhisper?.theme;

    // 过滤掉当前主题的句子
    const availableWhispers = currentTheme
      ? this.whispers.filter((w) => w.theme !== currentTheme)
      : this.whispers;

    // 如果过滤后没有句子了（极端情况），就用全部
    const candidates =
      availableWhispers.length > 0 ? availableWhispers : this.whispers;

    // 根据权重随机选择
    const totalWeight = candidates.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const whisper of candidates) {
      random -= whisper.weight;
      if (random <= 0) {
        return whisper;
      }
    }

    return candidates[0];
  }

  // 获取新的耳语
  next(): Whisper {
    this.previousWhisper = this.currentWhisper;
    this.currentWhisper = this.selectRandomWhisper();
    this.notifyListeners();
    return this.currentWhisper;
  }

  // 启动自动更新
  start(intervalMs: number = 10000): void {
    if (this.intervalId !== null) return;

    // 立即显示第一句
    this.next();

    // 设置定时器
    this.intervalId = window.setInterval(() => {
      this.next();
    }, intervalMs);
  }

  // 停止自动更新
  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // 订阅更新
  subscribe(callback: (whisper: Whisper) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    if (this.currentWhisper) {
      this.listeners.forEach((cb) => cb(this.currentWhisper!));
    }
  }

  // 获取当前耳语
  getCurrent(): Whisper | null {
    return this.currentWhisper;
  }

  // 未来扩展：添加新句子
  addWhisper(whisper: Whisper): void {
    this.whispers.push(whisper);
  }

  // 未来扩展：更新句子
  updateWhisper(index: number, whisper: Whisper): void {
    if (index >= 0 && index < this.whispers.length) {
      this.whispers[index] = whisper;
    }
  }

  // 未来扩展：删除句子
  removeWhisper(index: number): void {
    if (index >= 0 && index < this.whispers.length) {
      this.whispers.splice(index, 1);
    }
  }

  // 获取所有句子
  getAll(): Whisper[] {
    return [...this.whispers];
  }
}
