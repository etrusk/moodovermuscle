# Roo Code Documentation

Roo Code (formerly Roo Cline) is an AI-powered autonomous coding agent that lives in your editor. It helps you code faster and smarter, whether you're starting a new project, maintaining existing code, or learning new technologies.

## Table of Contents

1. [What Can Roo Code Do?](#what-can-roo-code-do)
2. [Quick Start](#quick-start)
3. [Key Features](#key-features)
4. [Using Modes](#using-modes)
5. [Tools and Capabilities](#tools-and-capabilities)
6. [Context Mentions](#context-mentions)
7. [Custom Instructions](#custom-instructions)
8. [Customizing Modes](#customizing-modes)
9. [Terminal Integration](#terminal-integration)
10. [Browser Automation](#browser-automation)
11. [Advanced Features](#advanced-features)
12. [Tips & Best Practices](#tips--best-practices)
13. [Troubleshooting](#troubleshooting)
14. [FAQ](#faq)

## What Can Roo Code Do?

- **Generate Code** from natural language descriptions
- **Refactor & Debug** existing code
- **Write & Update** documentation
- **Answer Questions** about your codebase
- **Automate** repetitive tasks
- **Create** new files and projects
- **Test** web applications through browser automation
- **Execute** commands and manage workflows

## Quick Start

1. **Install Roo Code** extension in VS Code
2. **Connect Your AI Provider** (Anthropic, OpenAI, etc.)
3. **Try Your First Task** - Open the Roo Code panel and describe what you want to do

## Key Features

### Multiple Modes

Roo Code adapts to your needs with specialized modes:

- **💻 Code Mode**: For general-purpose coding tasks
- **🏗️ Architect Mode**: For planning and technical leadership
- **❓ Ask Mode**: For answering questions and providing information
- **🪲 Debug Mode**: For systematic problem diagnosis
- **🪃 Orchestrator Mode**: For managing complex tasks and delegating work
- **Custom Modes**: Create unlimited specialized personas for specific tasks

### Smart Tools

Roo Code comes with powerful tools that can:

- Read and write files in your project
- Execute commands in your VS Code terminal
- Control a web browser for testing and automation
- Use external tools via MCP (Model Context Protocol)
- Search and analyze your codebase semantically

### Customization

Make Roo Code work your way with:

- **Custom Instructions** for personalized behavior
- **Custom Modes** for specialized tasks
- **Local Models** for offline use
- **Auto-Approval Settings** for faster workflows

## Using Modes

### Why Use Different Modes?

- **Task specialization**: Get precisely the type of assistance you need
- **Safety controls**: Prevent unintended modifications when planning or learning
- **Focused interactions**: Receive responses optimized for your current activity
- **Workflow optimization**: Seamlessly transition between different types of work

### Switching Between Modes

Four ways to switch modes:

1. **Dropdown menu**: Click the selector to the left of the chat input
2. **Slash command**: Type `/architect`, `/ask`, `/debug`, `/code`, or `/orchestrator`
3. **Keyboard shortcut**:
   - macOS: ⌘ + .
   - Windows/Linux: Ctrl + .
4. **Accept suggestions**: Click on mode switch suggestions that Roo offers

### Built-in Modes

#### 💻 Code Mode (Default)

- **Purpose**: General-purpose coding and development
- **Tool Access**: Full access to all tools (read, edit, browser, command, mcp)
- **Best For**: Writing code, implementing features, debugging

#### ❓ Ask Mode

- **Purpose**: Learning and explanation without making changes
- **Tool Access**: Limited (read, browser, mcp only - cannot edit files or run commands)
- **Best For**: Code explanation, concept exploration, technical learning

#### 🏗️ Architect Mode

- **Purpose**: System design and high-level planning
- **Tool Access**: Read, browser, mcp, and restricted edit (markdown files only)
- **Best For**: System design, architecture discussions, documentation

#### 🪲 Debug Mode

- **Purpose**: Systematic troubleshooting and problem-solving
- **Tool Access**: Full access to all tools
- **Best For**: Tracking down bugs, diagnosing errors, resolving complex issues

#### 🪃 Orchestrator Mode

- **Purpose**: Managing complex workflows by delegating to other modes
- **Tool Access**: No direct tool access (uses `new_task` to delegate)
- **Best For**: Multi-step projects, coordinating work across different specialties

## Tools and Capabilities

### Tool Categories

| Category     | Purpose                             | Tools                                                                    |
| ------------ | ----------------------------------- | ------------------------------------------------------------------------ |
| **Read**     | File system reading and exploration | `read_file`, `list_files`, `search_files`, `list_code_definition_names`  |
| **Edit**     | File system modifications           | `apply_diff`, `insert_content`, `search_and_replace`, `write_to_file`    |
| **Execute**  | System command execution            | `execute_command`                                                        |
| **Browser**  | Web automation                      | `browser_action`                                                         |
| **Workflow** | Mode and task management            | `switch_mode`, `new_task`, `ask_followup_question`, `attempt_completion` |
| **MCP**      | External tool integration           | `use_mcp_tool`, `access_mcp_resource`                                    |

### How Tools Work

1. **Describe** what you want to accomplish in natural language
2. **Review** the tool Roo proposes with its parameters
3. **Approve** the tool execution by clicking "Save"
4. **See results** and continue until your task is complete

### Tool Safety

Every tool use requires your explicit approval unless you've enabled auto-approval for specific operations. This ensures you maintain control over:

- Which files are modified
- What commands are executed
- How your codebase is changed

## Context Mentions

Context mentions allow you to provide Roo Code with specific information about your project using the `@` symbol.

### Types of Mentions

| Type            | Format                 | Description                        | Example                                  |
| --------------- | ---------------------- | ---------------------------------- | ---------------------------------------- |
| **File**        | `@/path/to/file.ts`    | Includes file contents             | "Explain the function in @/src/utils.ts" |
| **Folder**      | `@/path/to/folder`     | Includes all files in folder       | "Analyze the code in @/src/components"   |
| **Problems**    | `@problems`            | VS Code Problems panel diagnostics | "@problems Fix all errors in my code"    |
| **Terminal**    | `@terminal`            | Recent terminal output             | "Fix the errors shown in @terminal"      |
| **Git Commit**  | `@a1b2c3d`             | Specific commit details            | "What changed in commit @a1b2c3d?"       |
| **Git Changes** | `@git-changes`         | Uncommitted changes                | "Suggest a message for @git-changes"     |
| **URL**         | `@https://example.com` | Website content                    | "Summarize @https://docusaurus.io/"      |

### How to Use Mentions

1. Type `@` in the chat input to trigger suggestions
2. Continue typing to filter or use arrow keys to navigate
3. Select with Enter or mouse click
4. Combine multiple mentions: "Fix @problems in @/src/component.ts"

## Custom Instructions

Custom Instructions allow you to personalize how Roo behaves, providing specific guidance that shapes responses, coding style, and decision-making processes.

### Types of Custom Instructions

- **Global Instructions**: Apply to all modes across all projects
- **Workspace Instructions**: Apply only to the current project
- **Mode-Specific Instructions**: Apply only to specific modes

### Setting Custom Instructions

#### Global Instructions

1. Open Prompts Tab: Click the 🎯 icon in the Roo Code top menu bar
2. Find "Custom Instructions for All Modes" section
3. Enter your instructions
4. Click "Done" to save

#### Workspace Instructions

Create files in your project:

- **Preferred**: `.roo/rules/` directory with instruction files
- **Fallback**: `.roorules` file in workspace root

#### Mode-Specific Instructions

- **Via UI**: Use the Prompts tab to set instructions for specific modes
- **Via Files**: Create `.roo/rules-{modeSlug}/` directories or `.roorules-{modeSlug}` files

### Examples of Custom Instructions

- "Always use spaces for indentation, with a width of 4 spaces"
- "Use camelCase for variable names"
- "Write unit tests for all new functions"
- "Focus on code readability and maintainability"
- "When adding new features to websites, ensure they are responsive and accessible"

## Customizing Modes

### Why Create Custom Modes?

- **Specialization**: Create modes optimized for specific tasks
- **Safety**: Restrict access to sensitive files or commands
- **Team Collaboration**: Share standardized workflows
- **Experimentation**: Test different configurations safely

### Creating Custom Modes

#### Method 1: Ask Roo (Recommended)

Simply ask: "Create a custom mode for [specific task]" and Roo will guide you through the process.

#### Method 2: Using the Prompts Tab

1. Open Prompts Tab
2. Click the ➕ button next to "Modes"
3. Fill in the required fields:
   - **Name**: Display name (e.g., "📝 Documentation Writer")
   - **Slug**: Unique identifier (e.g., "docs-writer")
   - **Description**: Short summary for the UI
   - **Role Definition**: Detailed description of the mode's identity
   - **Available Tools**: Which tool groups the mode can access
   - **Custom Instructions**: Specific behavioral guidelines

#### Method 3: Manual Configuration (YAML/JSON)

Edit configuration files directly:

- **Global**: `custom_modes.yaml` or `custom_modes.json`
- **Project**: `.roomodes` file in project root

### Tool Groups and Permissions

- **read**: File reading, listing, and searching
- **edit**: File modification and creation
- **browser**: Web browsing capabilities
- **command**: Terminal command execution
- **mcp**: External tool integration

### File Restrictions

You can restrict which files a mode can edit using regex patterns:

```yaml
groups:
  - read
  - - edit
    - fileRegex: \.(js|ts)$
      description: JavaScript/TypeScript files only
  - command
```

## Terminal Integration

### What is Shell Integration?

Shell integration connects Roo Code to your terminal's command execution lifecycle, allowing it to:

- Execute commands through the `execute_command` tool
- Read command output in real-time
- Detect and fix errors automatically
- Track working directory changes
- React to terminal output intelligently

### Troubleshooting Shell Integration

If you see "Shell Integration Unavailable" messages:

1. **Update VS Code** to version 1.93 or later
2. **Select compatible shell**: Command Palette → "Terminal: Select Default Profile" → Choose bash, zsh, PowerShell, or fish
3. **Windows PowerShell users**: Run `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`
4. **WSL users**: Add `. "$(code --locate-shell-integration-path bash)"` to `~/.bashrc`

### Terminal Settings

Access terminal settings via the ⚙️ icon → Terminal group:

- **Terminal Output Limit**: Controls how much output is captured (default: 500 lines)
- **Compress Progress Bar Output**: Cleans up dynamic output like progress bars
- **Disable Terminal Shell Integration**: Toggle between Roo's inline terminal and VS Code's terminal

## Browser Automation

### Requirements

Browser automation requires **Claude Sonnet 3.5 or 3.7** model.

### How Browser Use Works

Roo Code can:

- Launch a browser automatically
- Capture screenshots of web pages
- Interact with web elements (click, type, scroll)
- Run invisibly in the background

### Available Browser Actions

| Action        | Description                    | When to Use                     |
| ------------- | ------------------------------ | ------------------------------- |
| `launch`      | Opens browser at a URL         | Starting a new session          |
| `click`       | Clicks at specific coordinates | Interacting with buttons, links |
| `type`        | Types text into active element | Filling forms, search boxes     |
| `scroll_down` | Scrolls down by one page       | Viewing content below the fold  |
| `scroll_up`   | Scrolls up by one page         | Returning to previous content   |
| `close`       | Closes the browser             | Ending a session                |

### Browser Settings

Configure browser behavior in Settings → Browser / Computer Use:

- **Enable browser tool**: Master toggle for browser functionality
- **Viewport size**: Resolution of browser session (900x600 default)
- **Screenshot quality**: WebP compression quality (75% default)
- **Remote browser connection**: Connect to existing Chrome instance

## Advanced Features

### Boomerang Tasks (Orchestrator Mode)

Break down complex projects into manageable subtasks using the 🪃 Orchestrator Mode:

1. **Orchestrator analyzes** complex task and suggests subtasks
2. **Subtask runs** in specialized mode with its own context
3. **Results summarized** and returned to orchestrator
4. **Process continues** until main task is complete

Benefits:

- Tackle complexity by breaking down large projects
- Use specialized modes for optimal results
- Maintain focus with isolated contexts
- Streamline workflows with automatic delegation

### Task Todo Lists

For complex, multi-step tasks, Roo Code automatically creates interactive todo lists that:

- Track progress through workflows
- Show current status of each item
- Allow editing of item descriptions
- Persist across sessions

### MCP (Model Context Protocol)

Extend Roo Code's capabilities by connecting to external servers that provide:

- Custom tools for specialized tasks
- Access to external APIs and databases
- Integration with third-party services

### Codebase Indexing

Create semantic search indexes of your project using AI embeddings for:

- Better understanding of large codebases
- Finding relevant code based on meaning
- Improved navigation and context awareness

## Tips & Best Practices

### Productivity Tips

- **Drag Roo Code** to the Secondary Sidebar to see Explorer, Search, etc.
- **Drag files** from Explorer into chat (hold Shift while dragging multiple files)
- **Turn off MCP** if not using it to reduce system prompt size
- **Limit file types** for custom modes to keep them focused
- **Use Sticky Models** to assign different AI models to different modes

### Prompt Engineering

- **Be clear and specific**: State exactly what you want Roo to do
- **Provide context**: Use `@mentions` to reference specific files or problems
- **Break down tasks**: Divide complex requests into smaller steps
- **Give examples**: Show the coding style or pattern you prefer
- **Specify output format**: Request specific formats (JSON, Markdown, etc.)

### Managing Context and Tokens

- **Be thoughtful** about Max Tokens settings for thinking models
- **Use context mentions selectively** - only include relevant files
- **Break down large tasks** into focused sub-tasks
- **Choose appropriate models** for different types of work

### Error Recovery

- **Delete messages** if you hit context limits
- **Roll back to checkpoints** if available
- **Switch to longer context models** (like Gemini) temporarily
- **Use Debug mode** for systematic troubleshooting

## Troubleshooting

### Common Issues

#### Roo Code Not Responding

- Check API key validity and expiration
- Verify internet connection
- Check API provider status
- Try restarting VS Code

#### File Editing Issues

- Disable "format on save" extensions
- Remove markdown preview settings that interfere with editing
- Check file permissions
- Restart VS Code after settings changes

#### Terminal Integration Problems

- Update VS Code to latest version
- Select compatible shell profile
- Configure execution policy (Windows PowerShell)
- Add shell integration manually if needed

#### Browser Automation Issues

- Ensure using Claude Sonnet 3.5 or 3.7
- Check browser tool is enabled in settings
- Verify viewport size and screenshot quality settings
- Test remote browser connection if using

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Discord Community**: Get help from other users
- **Documentation**: Check this guide for detailed information

## FAQ

### General Questions

**Q: Is Roo Code free to use?**
A: The extension is free and open-source, but you need API keys from providers like Anthropic or OpenAI, which charge based on usage.

**Q: Can I use Roo Code offline?**
A: Yes, if you use local models with Ollama or LM Studio.

**Q: What are the risks?**
A: Always review Roo's proposed changes before approving. Be cautious with auto-approval, especially for commands.

### Setup Questions

**Q: Which AI providers are supported?**
A: Anthropic (Claude), OpenAI, OpenRouter, Google Gemini, AWS Bedrock, Ollama, LM Studio, and many others.

**Q: How do I get an API key?**
A: Each provider has its own process. See the provider's documentation for specific instructions.

### Usage Questions

**Q: How do I start a new task?**
A: Open the Roo Code panel and type your request clearly and specifically.

**Q: What are context mentions?**
A: Use `@` to reference files, folders, problems, terminal output, or Git commits in your requests.

**Q: Can Roo Code access the internet?**
A: Yes, if using a provider/model that supports web browsing. Be mindful of security implications.

**Q: How do I provide feedback?**
A: Approve or reject Roo's proposed actions, and provide additional feedback in the feedback field.

### Advanced Questions

**Q: What is MCP?**
A: Model Context Protocol allows Roo Code to communicate with external servers for extended functionality.

**Q: How much does Codebase Indexing cost?**
A: Costs depend on project size and embedding model used. Initial indexing is most expensive; updates are incremental.

**Q: Can I create my own MCP servers?**
A: Yes, you can create custom MCP servers to add specialized functionality.

---

This documentation covers the core features and capabilities of Roo Code. For the most up-to-date information and detailed technical references, visit the official Roo Code documentation and community resources.
