import { createContext, useContext, useState, useCallback } from "react";
import type { StatementTabId } from "@/components/planning/financial-statements";

export type WorkspaceView = "dashboard" | "statements";

interface WorkspaceViewContextType {
  workspaceView: WorkspaceView;
  statementsDefaultTab: StatementTabId;
  navigateToStatements: (tab?: StatementTabId) => void;
  navigateToMyPlan: () => void;
}

const WorkspaceViewContext = createContext<WorkspaceViewContextType>({
  workspaceView: "dashboard",
  statementsDefaultTab: "summary",
  navigateToStatements: () => {},
  navigateToMyPlan: () => {},
});

export function WorkspaceViewProvider({ children }: { children: React.ReactNode }) {
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("dashboard");
  const [statementsDefaultTab, setStatementsDefaultTab] = useState<StatementTabId>("summary");

  const navigateToStatements = useCallback((tab?: StatementTabId) => {
    if (tab) setStatementsDefaultTab(tab);
    setWorkspaceView("statements");
  }, []);

  const navigateToMyPlan = useCallback(() => {
    setWorkspaceView("dashboard");
  }, []);

  return (
    <WorkspaceViewContext.Provider
      value={{ workspaceView, statementsDefaultTab, navigateToStatements, navigateToMyPlan }}
    >
      {children}
    </WorkspaceViewContext.Provider>
  );
}

export function useWorkspaceView() {
  return useContext(WorkspaceViewContext);
}
