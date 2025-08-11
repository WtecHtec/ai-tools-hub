import { ReactNode } from "react";
import { useMcpToolProvider } from "../_hooks/useMcpToolProvider";

export const ToolProviderWrapper = ({ children }: { children: ReactNode }) => {
  useMcpToolProvider();
  return <>{children}</>;
};
