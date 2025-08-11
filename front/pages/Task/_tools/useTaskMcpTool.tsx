import { mcpToolSdk } from "@/WebMCPSDK";
import { useCopilotAction } from "@copilotkit/react-core";
import { ETaskAction } from '../types'

const useTaskMcpTool = () => {
  useCopilotAction({
    name: ETaskAction.go_to_task,
    description: "跳转到任务页面",
    parameters: [],
    handler: () => {
      mcpToolSdk.enqueue({
        toolName: ETaskAction.go_to_task,
        params: undefined,
      });
    },
  });

  useCopilotAction({
    name: ETaskAction.search_task,
    description: "任务页面搜索",
    parameters: [
      {
        name: "user_keyword",
        type: "string",
        description: "搜索关键词",
        required: true,
      },
    ],
    handler: ({ user_keyword }) => {
      mcpToolSdk.enqueue({
        toolName: ETaskAction.search_task,
        params: { user_keyword },
      });
    },
  });
};

export default useTaskMcpTool;