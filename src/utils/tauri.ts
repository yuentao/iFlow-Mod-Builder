import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

// Check if running in Tauri environment
export const isTauri = '__TAURI_INTERNALS__' in window

// Unified Tauri invoke wrapper with web fallback
export async function tauriInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  if (!isTauri) {
    console.warn(`[Tauri] Command "${command}" not available in web mode`)
    return undefined as T
  }

  try {
    return await invoke<T>(command, args)
  } catch (error) {
    console.error(`Tauri command failed: ${command}`, error)
    throw new Error(`操作失败: ${error}`)
  }
}

// Event listener wrapper
export async function tauriListen<T>(
  event: string,
  handler: (payload: T) => void
) {
  if (!isTauri) {
    console.warn(`[Tauri] Event "${event}" not available in web mode`)
    return () => {}
  }

  return listen<T>(event, (e) => handler(e.payload))
}

// File dialog helpers using @tauri-apps/plugin-dialog
export async function selectDirectory(): Promise<string | null> {
  if (!isTauri) return null
  try {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const selected = await open({ directory: true, multiple: false })
    return selected as string | null
  } catch (e) {
    console.error('[Tauri] selectDirectory failed:', e)
    return null
  }
}

export async function selectFile(filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
  if (!isTauri) return null
  try {
    const { open } = await import('@tauri-apps/plugin-dialog')
    const selected = await open({ directory: false, multiple: false, filters })
    return selected as string | null
  } catch (e) {
    console.error('[Tauri] selectFile failed:', e)
    return null
  }
}

export async function saveFile(defaultName?: string): Promise<string | null> {
  if (!isTauri) return null
  try {
    const { save } = await import('@tauri-apps/plugin-dialog')
    const selected = await save({
      filters: [{ name: 'iFlow Mod', extensions: ['iflow-mod'] }],
      defaultPath: defaultName,
    })
    return selected
  } catch (e) {
    console.error('[Tauri] saveFile failed:', e)
    return null
  }
}
