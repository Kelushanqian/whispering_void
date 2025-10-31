// src/lib/theme.config.ts

export interface ThemeStyle {
  backgroundColor: string;
  textColor: string;
  fontSize: string;
  letterSpacing: string;
  lineHeight: string;
  fontWeight: number;
}

export interface AnimationConfig {
  fadeInDuration: number; // 淡入时长（毫秒）
  fadeOutDuration: number; // 淡出时长（毫秒）
  bgTransition: number; // 背景过渡时长（毫秒）
  interval: number; // 切换间隔（毫秒）
}

export interface ThemeConfig {
  themes: Record<string, ThemeStyle>;
  defaultTheme: ThemeStyle;
  animation: AnimationConfig;
}

// 基础样式配置 - 所有主题的默认值
const baseStyle: ThemeStyle = {
  backgroundColor: "#1a1a1a",
  textColor: "rgba(255, 255, 255, 0.85)",
  fontSize: "clamp(2rem, 3.5vw, 5rem)",
  letterSpacing: "0.05em",
  lineHeight: "1.6",
  fontWeight: 400,
};

// 辅助函数：合并基础样式和自定义样式
function createTheme(custom: Partial<ThemeStyle>): ThemeStyle {
  return { ...baseStyle, ...custom };
}

export const defaultThemeConfig: ThemeConfig = {
  themes: {
    beginning: createTheme({
      backgroundColor: "#4d4d69",
      textColor: "rgba(255, 255, 255, 0.85)",
    }),
    love: createTheme({
      backgroundColor: "#503645",
      textColor: "rgba(240, 255, 255, 0.9)",
    }),
    wait: createTheme({
      backgroundColor: "#404b45ff",
      textColor: "rgba(255, 245, 250, 0.85)",
    }),
    calm: createTheme({
      backgroundColor: "#323249ff",
      textColor: "rgba(255, 255, 255, 0.8)",
    }),
    time: createTheme({
      backgroundColor: "#2d2d44",
      textColor: "rgba(255, 255, 255, 0.85)",
    }),
    void: createTheme({
      backgroundColor: "#0a0a0a",
      textColor: "rgba(255, 255, 255, 0.75)",
      fontWeight: 200,
    }),
    cold: createTheme({
      backgroundColor: "#2c3e50",
      textColor: "rgba(255, 250, 245, 0.9)",
    }),
    warm: createTheme({
      backgroundColor: "#574240",
      textColor: "rgba(255, 236, 230, 0.85)",
    }),
    cool: createTheme({
      backgroundColor: "#29315b",
      textColor: "rgba(200, 210, 230, 0.85)",
    }),
    soft: createTheme({
      backgroundColor: "#42374d",
      textColor: "rgba(255, 240, 255, 0.9)",
    }),
    cute: createTheme({
      backgroundColor: "#52575c",
      textColor: "rgba(250, 255, 255, 0.8)",
    }),
    real: createTheme({
      backgroundColor: "#1b1b1b",
      textColor: "rgba(255, 255, 255, 0.7)",
      fontWeight: 200,
    }),
  },
  defaultTheme: baseStyle,
  animation: {
    fadeInDuration: 800,
    fadeOutDuration: 500,
    bgTransition: 2000,
    interval: 10000,
  },
};

// 导出可编辑的配置管理器
export class ThemeManager {
  private config: ThemeConfig;
  private themeChangeListeners: Set<() => void> = new Set();

  constructor(config: ThemeConfig = defaultThemeConfig) {
    this.config = JSON.parse(JSON.stringify(config)); // 深拷贝
  }

  getTheme(themeName: string): ThemeStyle {
    return this.config.themes[themeName] || this.config.defaultTheme;
  }

  getAnimation(): AnimationConfig {
    return this.config.animation;
  }

  updateTheme(themeName: string, style: Partial<ThemeStyle>): void {
    if (this.config.themes[themeName]) {
      this.config.themes[themeName] = {
        ...this.config.themes[themeName],
        ...style,
      };
      this.notifyThemeChange();
    }
  }

  updateAnimation(animation: Partial<AnimationConfig>): void {
    this.config.animation = {
      ...this.config.animation,
      ...animation,
    };
  }

  addTheme(themeName: string, style: ThemeStyle): void {
    this.config.themes[themeName] = style;
    this.notifyThemeChange();
  }

  removeTheme(themeName: string): void {
    if (this.config.themes[themeName]) {
      delete this.config.themes[themeName];
      this.notifyThemeChange();
    }
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(jsonString: string): void {
    try {
      this.config = JSON.parse(jsonString);
      this.notifyThemeChange();
    } catch (e) {
      console.error("Invalid config JSON", e);
    }
  }

  getAllThemes(): Record<string, ThemeStyle> {
    return { ...this.config.themes };
  }

  subscribeThemeChange(callback: () => void): () => void {
    this.themeChangeListeners.add(callback);
    return () => this.themeChangeListeners.delete(callback);
  }

  private notifyThemeChange(): void {
    this.themeChangeListeners.forEach((cb) => cb());
  }
}
