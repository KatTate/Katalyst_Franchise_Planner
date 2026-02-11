import "express-session";

declare module "express-session" {
  interface SessionData {
    impersonating_user_id?: string;
    impersonation_started_at?: string;
    return_brand_id?: string;
    impersonation_edit_enabled?: boolean;
    impersonation_audit_log_id?: string;
    demo_mode_brand_id?: string;
    demo_mode_user_id?: string;
  }
}
