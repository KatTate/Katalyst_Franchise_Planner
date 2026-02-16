import { createContext, useContext, useState, useCallback } from "react";
import type { StatementTabId } from "@/components/planning/financial-statements";

export type WorkspaceView = "my-plan" | "reports" | "scenarios" | "settings";

interface WorkspaceViewContextType {
  workspaceView: WorkspaceView;
  statementsDefaultTab: StatementTabId;
  activePlanName: string | null;
  setActivePlanName: (name: string | null) => void;
  navigateToStatements: (tab?: StatementTabId) => void;
  navigateToMyPlan: () => void;
  navigateToScenarios: () => void;
  navigateToSettings: () => void;
  resetWorkspaceView: () => void;
}

const WorkspaceViewContext = createContext<WorkspaceViewContextType>({
  workspaceView: "my-plan",
  statementsDefaultTab: "summary",
  activePlanName: null,
  setActivePlanName: () => {},
  navigateToStatements: () => {},
  navigateToMyPlan: () => {},
  navigateToScenarios: () => {},
  navigateToSettings: () => {},
  resetWorkspaceView: () => {},
});

export function WorkspaceViewProvider({ children }: { children: React.ReactNode }) {
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>("my-plan");
  const [statementsDefaultTab, setStatementsDefaultTab] = useState<StatementTabId>("summary");
  const [activePlanName, setActivePlanName] = useState<string | null>(null);

  const navigateToStatements = useCallback((tab?: StatementTabId) => {
    if (tab) setStatementsDefaultTab(tab);
    setWorkspaceView("reports");
  }, []);

  const navigateToMyPlan = useCallback(() => {
    setWorkspaceView("my-plan");
  }, []);

  const navigateToScenarios = useCallback(() => {
    setWorkspaceView("scenarios");
  }, []);

  const navigateToSettings = useCallback(() => {
    setWorkspaceView("settings");
  }, []);

  const resetWorkspaceView = useCallback(() => {
    setWorkspaceView("my-plan");
    setActivePlanName(null);
  }, []);

  return (
    <WorkspaceViewContext.Provider
      value={{
        workspaceView,
        statementsDefaultTab,
        activePlanName,
        setActivePlanName,
        navigateToStatements,
        navigateToMyPlan,
        navigateToScenarios,
        navigateToSettings,
        resetWorkspaceView,
      }}
    >
      {children}
    </WorkspaceViewContext.Provider>
  );
}

export function useWorkspaceView() {
  return useContext(WorkspaceViewContext);
}
