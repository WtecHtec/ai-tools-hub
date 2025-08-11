import { Task, TaskResult, ToolHandler, ToolMeta } from "./types";

class McpToolSdk {
  private static instance: McpToolSdk;
  private ctx: any = {};
  private tools = new Map<string, { meta: ToolMeta | undefined; handler: ToolHandler }>();
  private queue: Task[] = [];
  private running = false;
  private results: TaskResult[] = [];
  private registeredPages = new Set<string>();
  private copilotActions: any[] = [];
  
  private constructor() {}

  static getInstance() {
    if (!McpToolSdk.instance) {
      McpToolSdk.instance = new McpToolSdk();
    }
    return McpToolSdk.instance;
  }

  registerContext(ctx: any) {
    this.ctx = { ...this.ctx, ctx };
  }

  registerTool(name: string, handler: ToolHandler, meta?: ToolMeta) {
    this.tools.set(name, { meta: meta, handler });
    // 标识页面注册完成（如果name对应页面ID）
    this.registeredPages.add(name);
  }

  isPageRegistered(name: string) {
    return this.registeredPages.has(name);
  }

  enqueue(task: Task) {
    this.queue.push(task);
    this.runQueue();
  }

  private async runQueue() {
    if (this.running || this.queue.length === 0) return;
    this.running = true;

    while (this.queue.length > 0) {
      const task = this.queue[0];

      // 如果页面未注册，等待或跳过
      if (!this.isPageRegistered(task.toolName)) {
        console.warn(`页面或工具[${task.toolName}]未注册，等待中...`);
        const ready = await this.waitForRegistration(task.toolName, 5000);
        if (!ready) {
          this.results.push({
            task,
            success: false,
            error: `等待页面或工具[${task.toolName}]注册超时，跳过任务`,
          });
          this.queue.shift();
          continue;
        }
      }

      try {
        const tool = this.tools.get(task.toolName);
        if (!tool) throw new Error(`工具未找到: ${task.toolName}`);

        const res = await tool.handler(this.ctx, task.params);
        this.results.push({ task, success: res.success, data: res.data, error: res.message });
      } catch (e: any) {
        this.results.push({ task, success: false, error: e.message || "未知错误" });
      }

      this.queue.shift();
    }

    // 清理结果
    this.results = [];
    this.running = false;
  }

  private waitForRegistration(name: string, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const interval = 100;
      let elapsed = 0;
      const timer = setInterval(() => {
        if (this.isPageRegistered(name)) {
          clearInterval(timer);
          resolve(true);
        } else {
          elapsed += interval;
          if (elapsed >= timeoutMs) {
            clearInterval(timer);
            resolve(false);
          }
        }
      }, interval);
    });
  }

  addCopilotAction(copilotAction: any) {
    this.copilotActions = [...this.copilotActions, copilotAction];
  }

  initCopilotAction() {
    this.copilotActions.forEach((ca) => {
      try {
        ca();
      } catch {
        console.log("初始化失败");
      }
    });
  }
}

export const mcpToolSdk = McpToolSdk.getInstance();
