interface EnvironmentConfig {
  API_BASE_URL: string;
  APP_ENV: 'development' | 'staging' | 'production';
  DEBUG_MODE: boolean;
  API_TIMEOUT: number;
  ENABLE_LOGGING: boolean;
}

class ConfigManager {
  private config: EnvironmentConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): EnvironmentConfig {
    return {
      API_BASE_URL: process.env.REACT_APP_SERVER_URL || 'http://localhost:3000',
      APP_ENV: (process.env.REACT_APP_ENV as 'development' | 'staging' | 'production') || 'development',
      DEBUG_MODE: process.env.REACT_APP_DEBUG === 'true' || process.env.NODE_ENV === 'development',
      API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000'),
      ENABLE_LOGGING: process.env.REACT_APP_ENABLE_LOGGING !== 'false',
    };
  }

  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  getAll(): EnvironmentConfig {
    return { ...this.config };
  }

  isDevelopment(): boolean {
    return this.config.APP_ENV === 'development';
  }

  isProduction(): boolean {
    return this.config.APP_ENV === 'production';
  }

  isStaging(): boolean {
    return this.config.APP_ENV === 'staging';
  }
}

export const config = new ConfigManager();
export type { EnvironmentConfig };