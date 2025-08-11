export type ToolMeta = {
    title: string;
    description: string;
    inputSchema: any; // 这里可接入zod/yup等校验库定义
  };
  
export type ToolHandler = (ctx: any, params: any) => Promise<{ success: boolean; data?: any; message?: string }>;
  
export type Task = {
    toolName: string;
    params: any;
  };
  
export  type TaskResult = {
    task: Task;
    success: boolean;
    data?: any;
    error?: string;
  };
  