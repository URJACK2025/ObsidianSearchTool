// main.ts
import { Plugin, WorkspaceLeaf, Notice, PluginSettingTab, Setting } from 'obsidian';

interface PluginSettings {
    targetFoldersCount: number;
    targetFolders: string[];
}

const DEFAULT_SETTINGS: PluginSettings = {
    targetFoldersCount: 1,
    targetFolders: ['Area/10-Tools/']
};

export default class FileSearchMacroPlugin extends Plugin {
    settings: PluginSettings = DEFAULT_SETTINGS;

    async onload() {
        // 加载设置
        await this.loadSettings();

        // 添加设置界面
        this.addSettingTab(new FileSearchMacroSettingTab(this.app, this));

        // 注册命令
        this.addCommand({
            id: 'search-file-in-folder',
            name: 'Search file in configured folder',
            callback: () => this.searchFileInFolder()
        });
    }

    async searchFileInFolder() {
        // 弹出输入框
        const fileName = await this.askForFileName();
        if (!fileName) return;

        try {
            // 调试信息1：显示原始输入的文件名
            // new Notice(`调试1-原始文件名: ${fileName}`, 5000);

            // 调试信息2：显示目标文件夹
            // new Notice(`调试2-目标文件夹: ${this.settings.targetFolder}`, 5000);

            // 构造原始查询字符串，支持多个文件夹路径
            // 按照用户提供的正确格式：(path:"folder1" OR path:"folder2") file:"filename"
            const validPaths = this.settings.targetFolders.filter(path => path.trim());
            let pathQueries = '';
            
            if (validPaths.length > 1) {
                // 多个文件夹路径时，需要用括号括起来
                pathQueries = `(${validPaths.map(path => `path:"${path.trim()}"`).join(' OR ')})`;
            } else if (validPaths.length === 1 && validPaths[0]) {
                // 单个文件夹路径时，不需要括号，并确保validPaths[0]存在
                pathQueries = `path:"${validPaths[0].trim()}"`;
            }
            
            const rawQueryString = `${pathQueries} file:"${fileName}"`;

            // 调试信息3：显示原始查询字符串
            // new Notice(`调试3-原始查询字符串: ${rawQueryString}`, 5000);

            // 对整个查询字符串进行完整的URL编码，确保所有特殊字符都被编码
            const fullyEncodedQuery = encodeURIComponent(rawQueryString);

            // 调试信息4：显示完全编码后的查询
            // new Notice(`调试4-完全编码查询: ${fullyEncodedQuery}`, 5000);

            // 构造符合要求的Obsidian搜索URI
            const obsidianSearchUri = `obsidian://search?query=${fullyEncodedQuery}`;

            // 调试信息5：显示最终搜索URI
            // new Notice(`调试5-搜索URI: ${obsidianSearchUri}`, 5000);

            // 尝试使用openLinkText方法打开URI
            // this.app.workspace.openLinkText(obsidianSearchUri, '', true);
            window.open(obsidianSearchUri, '_blank');

        } catch (e) {
            // 捕获并显示错误详情
            new Notice(`调试-错误: ${e}`, 5000);
            new Notice('打开搜索面板失败，请手动搜索');
        }
    }

    async askForFileName(): Promise<string | null> {
        return new Promise((resolve) => {
            const input = new Notice('', 0); // 持久化弹窗
            const container = input.noticeEl.parentElement;

            if (!container) {
                resolve(null);
                return;
            }

            const instructions = container.createEl('div', { text: '请输入要搜索的文件名:' });
            const inputEl = container.createEl('input', { type: 'text', placeholder: '例如：WebVuln' });
            const buttonContainer = container.createEl('div');

            const submit = buttonContainer.createEl('button', { text: '搜索' });
            const cancel = buttonContainer.createEl('button', { text: '取消' });

            const cleanup = () => {
                input.hide();
                try {
                    container.removeChild(instructions);
                    container.removeChild(inputEl);
                    container.removeChild(buttonContainer);
                } catch (e) {
                    // 忽略DOM移除错误
                }
            };

            submit.onclick = () => {
                cleanup();
                resolve(inputEl.value.trim());
            };

            cancel.onclick = () => {
                cleanup();
                resolve(null);
            };

            inputEl.focus();
            inputEl.onkeydown = (e: KeyboardEvent) => {
                if (e.key === 'Enter') submit.click();
                if (e.key === 'Escape') cancel.click();
            };
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

// 设置页面
class FileSearchMacroSettingTab extends PluginSettingTab {
    plugin: FileSearchMacroPlugin;

    constructor(app: any, plugin: FileSearchMacroPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: '文件搜索宏设置' });

        // 添加文件夹数量选择
        new Setting(containerEl)
            .setName('目标文件夹数量')
            .setDesc('选择要配置的文件夹数量（1-6）')
            .addDropdown(dropdown => {
                // 添加1-6个选项
                for (let i = 1; i <= 6; i++) {
                    dropdown.addOption(i.toString(), `${i} 个文件夹`);
                }
                
                // 设置当前值
                dropdown.setValue(this.plugin.settings.targetFoldersCount.toString());
                
                // 处理变化事件
                dropdown.onChange(async (value: string) => {
                    const count = parseInt(value);
                    const currentCount = this.plugin.settings.targetFolders.length;
                    
                    // 调整数组大小
                    if (count > currentCount) {
                        // 增加数组元素
                        for (let i = currentCount; i < count; i++) {
                            this.plugin.settings.targetFolders.push('');
                        }
                    } else if (count < currentCount) {
                        // 减少数组元素
                        this.plugin.settings.targetFolders = this.plugin.settings.targetFolders.slice(0, count);
                    }
                    
                    this.plugin.settings.targetFoldersCount = count;
                    await this.plugin.saveSettings();
                    // 重新渲染设置页面
                    this.display();
                });
            });

        // 根据选择的数量显示相应的文件夹路径输入框
        for (let i = 0; i < this.plugin.settings.targetFoldersCount; i++) {
            new Setting(containerEl)
                .setName(`目标文件夹路径 ${i + 1}`)
                .setDesc('输入要搜索的文件夹路径，如：Area/10-Tools/')
                .addText(text => text
                    .setPlaceholder('例如：Area/10-Tools/')
                    .setValue(this.plugin.settings.targetFolders[i] || '')
                    .onChange(async (value: string) => {
                        this.plugin.settings.targetFolders[i] = value;
                        await this.plugin.saveSettings();
                    }));
        }
    }
}