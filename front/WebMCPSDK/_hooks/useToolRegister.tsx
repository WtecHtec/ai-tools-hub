import { useEffect } from "react";
import { mcpToolSdk } from "@/WebMCPSDK";
import { ToolHandler, ToolMeta } from "../types";

const useToolRegister = (name: string, handler: ToolHandler, meta?: ToolMeta) => {
    useEffect(() => {
        mcpToolSdk.registerTool(
            name,
            async (ctx, params) => {
                return handler(ctx, params);
            },
            meta
        );
    }, []);
}

export default useToolRegister;