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
  fadeInDuration: number;    // 淡入时长（毫秒）
  fadeOutDuration: number;   // 淡出时长（毫秒）
  bgTransition: number;      // 背景过渡时长（毫秒）
  interval: number;          // 切换间隔（毫秒）
}

export interface ThemeConfig {
  themes: Record<string, ThemeStyle>;
  defaultTheme: ThemeStyle;
  animation: AnimationConfig;
}

export const defaultThemeConfig: ThemeConfig = {
  themes: {
    beginning: {
      backgroundColor: '#1a1a2e',
      textColor: 'rgba(255, 255, 255, 0.85)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.05em',
      lineHeight: '1.6',
      fontWeight: 500
    },
    nature: {
      backgroundColor: '#0f3460',
      textColor: 'rgba(240, 255, 255, 0.9)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.05em',
      lineHeight: '1.6',
      fontWeight: 500
    },
    memory: {
      backgroundColor: '#16213e',
      textColor: 'rgba(255, 245, 250, 0.85)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.05em',
      lineHeight: '1.6',
      fontWeight: 500
    },
    waiting: {
      backgroundColor: '#1f1f3a',
      textColor: 'rgba(255, 255, 255, 0.8)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.05em',
      lineHeight: '1.6',
      fontWeight: 500
    },
    time: {
      backgroundColor: '#2d2d44',
      textColor: 'rgba(255, 255, 255, 0.85)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.05em',
      lineHeight: '1.6',
      fontWeight: 500
    },
    void: {
      backgroundColor: '#0a0a0a',
      textColor: 'rgba(255, 255, 255, 0.75)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.08em',
      lineHeight: '1.6',
      fontWeight: 200
    },
    gentle: {
      backgroundColor: '#2c3e50',
      textColor: 'rgba(255, 250, 245, 0.9)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.05em',
      lineHeight: '1.6',
      fontWeight: 500
    },
    dream: {
      backgroundColor: '#1e2a3a',
      textColor: 'rgba(230, 240, 255, 0.85)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.05em',
      lineHeight: '1.6',
      fontWeight: 500
    },
    melancholy: {
      backgroundColor: '#1a1f3a',
      textColor: 'rgba(200, 210, 230, 0.85)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.05em',
      lineHeight: '1.6',
      fontWeight: 500
    },
    discovery: {
      backgroundColor: '#2d1b3d',
      textColor: 'rgba(255, 240, 255, 0.9)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.05em',
      lineHeight: '1.6',
      fontWeight: 500
    },
    undefined: {
      backgroundColor: '#1c1c2e',
      textColor: 'rgba(200, 200, 200, 0.8)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.05em',
      lineHeight: '1.6',
      fontWeight: 500
    },
    silence: {
      backgroundColor: '#151515',
      textColor: 'rgba(255, 255, 255, 0.7)',
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      letterSpacing: '0.1em',
      lineHeight: '1.6',
      fontWeight: 200
    }
  },
  defaultTheme: {
    backgroundColor: '#1a1a1a',
    textColor: 'rgba(255, 255, 255, 0.85)',
    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    letterSpacing: '0.05em',
    lineHeight: '1.6',
    fontWeight: 500
  },
  animation: {
    fadeInDuration: 800,
    fadeOutDuration: 500,
    bgTransition: 2000,
    interval: 10000
  }
};

// 导出可编辑的配置管理器
export class ThemeManager {
  private config: ThemeConfig;

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
        ...style
      };
    }
  }

  updateAnimation(animation: Partial<AnimationConfig>): void {
    this.config.animation = {
      ...this.config.animation,
      ...animation
    };
  }

  addTheme(themeName: string, style: ThemeStyle): void {
    this.config.themes[themeName] = style;
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(jsonString: string): void {
    try {
      this.config = JSON.parse(jsonString);
    } catch (e) {
      console.error('Invalid config JSON', e);
    }
  }

  getAllThemes(): Record<string, ThemeStyle> {
    return { ...this.config.themes };
  }
}