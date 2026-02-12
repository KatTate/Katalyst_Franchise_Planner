---
name: 'step-06-final-assessment'
description: 'Compile final assessment and polish the readiness report'

# Path Definitions
installed_path: '{project-root}/_bmad/bmm/workflows/3-solutioning/implementation-readiness'

# File References
thisStepFile: './step-06-final-assessment.md'
workflowFile: '{installed_path}/workflow.md'
outputFile: '{planning_artifacts}/implementation-readiness-report-{{date}}.md'
---

# Step 6: Final Assessment

## STEP GOAL:

To provide a comprehensive summary of all findings and give the report a final polish, ensuring clear recommendations and overall readiness status.

## MANDATORY EXECUTION RULES (READ FIRST):

### Universal Rules:

- 🛑 NEVER generate content without user input
- 📖 CRITICAL: Read the complete step file before taking any action
- 📖 You are at the final step - complete the assessment
- 📋 YOU ARE A FACILITATOR, not a content generator
- ✅ YOU MUST ALWAYS SPEAK OUTPUT In your Agent communication style with the config `{communication_language}`

### Role Reinforcement:

- ✅ You are delivering the FINAL ASSESSMENT
- ✅ Your findings are objective and backed by evidence
- ✅ Provide clear, actionable recommendations
- ✅ Success is measured by value of findings

### Step-Specific Rules:

- 🎯 Compile and summarize all findings
- 🚫 Don't soften the message - be direct
- 💬 Provide specific examples for problems
- 🚪 Add final section to the report

## EXECUTION PROTOCOLS:

- 🎯 Review all findings from previous steps
- 💾 Add summary and recommendations
- 📖 Determine overall readiness status
- 🚫 Complete and present final report

## FINAL ASSESSMENT PROCESS:

### 1. Initialize Final Assessment

"Completing **Final Assessment**.

I will now:

1. Review all findings from previous steps
2. Provide a comprehensive summary
3. Add specific recommendations
4. Determine overall readiness status"

### 2. Review Previous Findings

Check the {outputFile} for sections added by previous steps:

- File and FR Validation findings
- UX Alignment issues
- Epic Quality violations

### 2.5. Environment Readiness Verification

Before assessing document readiness, verify the Replit environment is prepared for implementation:

**Database Readiness:**
- Check if a PostgreSQL database exists (look for DATABASE_URL environment variable)
- If the architecture document specifies database usage and no database exists, flag as CRITICAL — "Architecture requires a database but none is provisioned"
- If a database exists, verify it's accessible

**Secrets and Environment Variables:**
- Check which environment variables and secrets are configured (names only, never values)
- Cross-reference against the architecture document's external service dependencies
- If the architecture references services (e.g., email, payment, AI, auth) but corresponding API keys/secrets are not configured, flag as WARNING — "Architecture references {{service}} but no credentials are configured"

**Deployment Configuration:**
- Check if deployment/publishing is configured
- If deployment config exists, note the deployment type (static, autoscale, vm, scheduled)
- If no deployment config and the project is a web application, flag as INFO — "No deployment configuration found"

**Codebase Health (for brownfield projects):**
- If source code already exists, run LSP diagnostics on the main source files
- Count errors and warnings as a baseline health indicator
- Search the codebase for tech debt markers (TODO, FIXME, HACK, WORKAROUND) — case-insensitive, excluding node_modules, .git, build/dist
- Report the baseline debt count so it can be tracked through implementation

**Integration Readiness:**
- Check if any Replit integrations are already configured
- Cross-reference against architecture document's integration requirements
- Flag any gaps between required and configured integrations

Append findings to {outputFile} under a new section:

```markdown
## Environment Readiness

### Database: [READY / NOT PROVISIONED / NOT REQUIRED]
[Details]

### Secrets & Configuration: [READY / GAPS FOUND / NOT REQUIRED]
[Details — list gaps if any]

### Deployment: [CONFIGURED / NOT CONFIGURED]
[Details]

### Codebase Health: [CLEAN / ISSUES FOUND / N/A (greenfield)]
- LSP errors: [count]
- LSP warnings: [count]
- Tech debt markers: [count]

### Integrations: [READY / GAPS FOUND / NOT REQUIRED]
[Details]
```

### 3. Add Final Assessment Section

Append to {outputFile}:

```markdown
## Summary and Recommendations

### Overall Readiness Status

[READY/NEEDS WORK/NOT READY]

### Critical Issues Requiring Immediate Action

[List most critical issues that must be addressed]

### Recommended Next Steps

1. [Specific action item 1]
2. [Specific action item 2]
3. [Specific action item 3]

### Final Note

This assessment identified [X] issues across [Y] categories. Address the critical issues before proceeding to implementation. These findings can be used to improve the artifacts or you may choose to proceed as-is.
```

### 4. Complete the Report

- Ensure all findings are clearly documented
- Verify recommendations are actionable
- Add date and assessor information
- Save the final report

### 5. Present Completion

Display:
"**Implementation Readiness Assessment Complete**

Report generated: {outputFile}

The assessment found [number] issues requiring attention. Review the detailed report for specific findings and recommendations."

## WORKFLOW COMPLETE

The implementation readiness workflow is now complete. The report contains all findings and recommendations for the user to consider.

Implementation Readiness complete. Read fully and follow: `_bmad/core/tasks/help.md` with argument `implementation readiness`.

---

## 🚨 SYSTEM SUCCESS/FAILURE METRICS

### ✅ SUCCESS:

- All findings compiled and summarized
- Environment readiness verified (database, secrets, deployment, integrations)
- Codebase health baseline established (if brownfield)
- Clear recommendations provided
- Readiness status determined
- Final report saved

### ❌ SYSTEM FAILURE:

- Not reviewing previous findings
- Skipping environment readiness verification
- Not checking database/secrets against architecture requirements
- Incomplete summary
- No clear recommendations
