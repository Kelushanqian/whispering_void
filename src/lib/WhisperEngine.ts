// src/lib/WhisperEngine.ts

export interface Whisper {
  text: string;
  theme: string;
  weight: number;
}

export class WhisperEngine {
  private whispers: Whisper[] = [];
  private currentWhisper: Whisper | null = null;
  private intervalId: number | null = null;
  private listeners: Set<(whisper: Whisper) => void> = new Set();
  private dataChangeListeners: Set<() => void> = new Set();

  constructor(whispers: Whisper[]) {
    this.whispers = whispers;
  }

  private selectRandomWhisper(): Whisper {
    if (this.whispers.length === 0) {
      return { text: "虚空中什么都没有...", theme: "void", weight: 1 };
    }

    const currentTheme = this.currentWhisper?.theme;
    const availableWhispers = currentTheme
      ? this.whispers.filter((w) => w.theme !== currentTheme)
      : this.whispers;

    const candidates =
      availableWhispers.length > 0 ? availableWhispers : this.whispers;

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

  next(): Whisper {
    this.currentWhisper = this.selectRandomWhisper();
    this.notifyListeners();
    return this.currentWhisper;
  }

  start(intervalMs: number = 10000): void {
    if (this.intervalId !== null) return;
    this.currentWhisper = {
      text: "程序已启动，世界暂时安静。",
      theme: "beginning",
      weight: 0,
    };
    this.notifyListeners();
    this.intervalId = window.setInterval(() => {
      this.next();
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(callback: (whisper: Whisper) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // 订阅数据变更
  subscribeDataChange(callback: () => void): () => void {
    this.dataChangeListeners.add(callback);
    return () => this.dataChangeListeners.delete(callback);
  }

  private notifyListeners(): void {
    if (this.currentWhisper) {
      this.listeners.forEach((cb) => cb(this.currentWhisper!));
    }
  }

  // 通知数据变更
  private notifyDataChange(): void {
    this.dataChangeListeners.forEach((cb) => cb());
  }

  getCurrent(): Whisper | null {
    return this.currentWhisper;
  }

  addWhisper(whisper: Whisper): void {
    this.whispers.unshift(whisper);
    this.notifyDataChange();
  }

  updateWhisper(index: number, whisper: Whisper): void {
    if (index >= 0 && index < this.whispers.length) {
      this.whispers[index] = whisper;
      this.notifyDataChange();
    }
  }

  removeWhisper(index: number): void {
    if (index >= 0 && index < this.whispers.length) {
      this.whispers.splice(index, 1);
      this.notifyDataChange();
    }
  }

  getAll(): Whisper[] {
    return [...this.whispers];
  }
}
