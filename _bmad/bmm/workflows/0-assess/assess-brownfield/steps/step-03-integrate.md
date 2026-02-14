# Step 3: Integration & Kickoff

## MANDATORY EXECUTION RULES (READ FIRST):

- Use the chosen path from Step 2
- UPDATE the replit.md project state with established project findings
- SET UP the next workflow in the chosen path
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

## EXECUTION PROTOCOLS:

- Finalize the established project assessment document
- Update replit.md with the project state and chosen path
- Guide the user to their first workflow step
- FORBIDDEN to skip the replit.md update

## YOUR TASK:

Finalize the established project assessment, update project state, and hand off to the chosen BMAD workflow path.

## INTEGRATION SEQUENCE:

### 1. Finalize Assessment Document

Update the established project assessment document at `{output_file}` with:
- The chosen path and rationale
- Phase mapping results
- Recommended workflow sequence
- Any notes or caveats from the user's feedback

### 2. Update replit.md Project State

Read `{project-root}/replit.md` and update the **"Project Documentation"** section that appears AFTER the `<!-- BMAD-METHOD-END -->` marker. **Do NOT modify anything between the `<!-- BMAD-METHOD-START -->` and `<!-- BMAD-METHOD-END -->` markers** — that is protected BMad framework content.

Add or update a **Project State** subsection within the Project Documentation area:

```
### Project State

- **Current Phase:** {{chosen_phase}} (entered via established project assessment)
- **Project Type:** established
- **Established Project Path:** {{path_letter}} — {{path_name}}
- **Completed Artifacts:** established-project-assessment.md
- **Technology Stack:** {{primary_tech_summary}}
- **Next Workflow:** {{first_workflow_in_path}}
```

### 3. Run Generate Project Context (if applicable)

If the chosen path includes GPC (Paths A, B, or D), inform the user:

"Before we start {{first_workflow}}, I recommend running **Generate Project Context** first. This creates a lean reference file that helps all BMAD agents understand your existing code patterns and conventions.

Say **'generate project context'** or **'GPC'** to start."

### 4. Present Kickoff Summary

"**Established Project Assessment Complete!**

**Your Project:** {project_name}
**Chosen Path:** {{path_letter}} — {{path_name}}
**Assessment saved to:** {{output_file}}

**Your workflow sequence:**
{{numbered_workflow_sequence}}

**To get started, say:**
- {{first_trigger_phrase}}

**Anytime you need guidance, just ask:**
- 'What should I do next?'
- 'Help me figure out where to start'

Let's build something great with what you already have!"

## SUCCESS METRICS:

- Assessment document is complete with all findings and chosen path
- replit.md is updated with established project state
- User knows exactly what to do next
- First workflow trigger is clearly communicated
- Project context generation is recommended where appropriate

## FAILURE MODES:

- Not updating replit.md project state
- Not finalizing the assessment document
- Leaving the user unsure about their next step
- Not recommending GPC when the codebase needs it

## WORKFLOW COMPLETE

This is the final step of the established project assessment workflow. The user should now proceed to their chosen BMAD workflow path.
