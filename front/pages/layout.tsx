import "@copilotkit/react-ui/styles.css";

import { CopilotPopup } from "@copilotkit/react-ui";
import { CopilotKit } from "@copilotkit/react-core";
import { ToolProviderWrapper } from "@/WebMCPSDK/ToolProviderWrapper";
import TaskApp from "@/pages/TaskApp"
import "@/pages/Task/_tools/useTaskMcpTool"
const Layout = () => {
  return (
    <>
      <CopilotKit
        runtimeUrl={`http://localhost:3100/copilotkit`}
        showDevConsole={false}
      >
        <ToolProviderWrapper>
            <TaskApp />
        </ToolProviderWrapper>
        <CopilotPopup
          instructions={
            "You are assisting the user as best as you can. Answer in the best way possible given the data you have."
          }
          labels={{
            title: "Popup Assistant",
            initial: "Need any help?",
          }}
        />
      </CopilotKit>
    </>
  );
};
