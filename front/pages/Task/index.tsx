import { mcpToolSdk } from "@/WebMCPSDK";
import useToolRegister from "@/hooks/useToolRegister";
import { ETaskAction } from "./types";

const TaskApp = () => {
    // 注册tools
    useToolRegister(ETaskAction.go_to_task, async () => {
        // 操作行为
        return { success: true };
    })

  return <></>;
};
export default TaskApp;
