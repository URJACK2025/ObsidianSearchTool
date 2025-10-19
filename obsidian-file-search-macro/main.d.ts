import { Plugin } from 'obsidian';
interface PluginSettings {
    targetFolder: string;
}
export default class FileSearchMacroPlugin extends Plugin {
    settings: PluginSettings;
    onload(): Promise<void>;
    searchFileInFolder(): Promise<void>;
    askForFileName(): Promise<string | null>;
    loadSettings(): Promise<void>;
    saveSettings(): Promise<void>;
}
export {};
//# sourceMappingURL=main.d.ts.map