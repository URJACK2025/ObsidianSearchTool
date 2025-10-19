# File Search Macro 插件

## 功能简介

File Search Macro 是一个 Obsidian 插件，提供了一个简单高效的方式在指定文件夹中搜索文件名。用户可以通过快捷键或命令面板调用该功能，输入要搜索的文件名，插件会自动在配置的目标文件夹中执行搜索。

## 插件安装说明

### 方法一：手动安装

1. 将 `obsidian-file-search-macro` 文件夹复制到你的 Obsidian 库的 `.obsidian/plugins/` 目录下
2. 或者，只需复制核心文件 `main.js` 和 `manifest.json` 到 `.obsidian/plugins/obsidian-file-search-macro/` 目录
3. 重启 Obsidian
4. 在 Obsidian 设置的「社区插件」选项中启用「File Search Macro」插件

## 使用方法

1. 按下快捷键或通过命令面板调用 "Search file in configured folder" 命令
2. 在弹出的输入框中输入要搜索的文件名
3. 点击「搜索」按钮或按 Enter 键开始搜索
4. 插件会自动打开 Obsidian 的搜索面板，并预填充搜索条件

## 配置说明

1. 打开 Obsidian 设置
2. 点击「插件选项」
3. 选择「文件搜索宏设置」
4. 在「目标文件夹路径」输入框中设置要搜索的文件夹路径
   - 例如：`Area/10-Tools/`
   - 注意：路径需要相对于你的 Vault 根目录

## 技术说明

该插件通过构建 Obsidian 搜索语法的查询字符串 `path:"目标文件夹" file:"文件名"`，并将其编码后通过 `obsidian://search?query=` 协议打开 Obsidian 的搜索功能。搜索条件精确匹配指定文件夹中的文件名，帮助用户快速定位需要的文件。

## 注意事项

- 请确保在设置中正确配置目标文件夹路径
- 搜索功能依赖于 Obsidian 的内置搜索系统
- 文件名匹配时会使用 Obsidian 的搜索语法规则