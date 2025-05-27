import { Config } from '../types';

export async function getConfig(): Promise<Config> {
  const module = await import(`./${requiredEnv('ENV')}`);
  return module.default;
}

export function requiredEnv(name: string): string {
  return (
    process.env[name] ||
    console.error('Error missing:', name) ||
    process.exit(1)
  );
}

export function optionalEnv(name: string): string | undefined {
  return process.env[name];
}
