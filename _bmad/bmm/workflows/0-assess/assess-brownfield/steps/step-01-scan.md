# Step 1: Project Scan & Discovery

## MANDATORY EXECUTION RULES (READ FIRST):

- NEVER make assumptions about the project without scanning files first
- ALWAYS treat this as collaborative discovery — present findings and ask for user confirmation
- YOU ARE A FACILITATOR discovering what exists, not judging what should exist
- FOCUS on practical facts: what's built, what tech is used, what works
- YOU MUST ALWAYS SPEAK OUTPUT in your Agent communication style with the config `{communication_language}`

## EXECUTION PROTOCOLS:

- Show your analysis before taking any action
- Read existing project files systematically
- Initialize the assessment document with findings
- FORBIDDEN to load next step until scan is complete and user approves

## YOUR TASK:

Systematically scan the existing Replit project to discover its current state, technology stack, architecture, and patterns.

## SCAN SEQUENCE:

### 1. Replit Environment Scan

Check for Replit-specific configuration and state:

**Workflows:**
- Check for configured workflows (running servers, build processes)
- Note what ports are in use and what servers are running

**Database:**
- Check if a PostgreSQL database exists (look for DATABASE_URL, PGHOST env vars)
- If database exists, scan schema (tables, relationships)

**Environment Variables & Secrets:**
- Check for configured environment variables (names only, never values)
- Identify which external services are integrated

**Deployment:**
- Check for deployment configuration
- Note if the project has been deployed before

### 2. Technology Stack Discovery

Scan project files to identify the full tech stack:

**Package Files:**
- `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `Gemfile`, etc.
- Extract exact versions of all dependencies
- Note development vs production dependencies
- Identify the framework (Next.js, Express, Flask, Django, etc.)

**Configuration Files:**
- Language-specific configs (`tsconfig.json`, `pyproject.toml`, etc.)
- Build tool configs (webpack, vite, etc.)
- Linting and formatting configs
- Testing configurations

**Project Structure:**
- Map the directory tree (top 3 levels)
- Identify source directories, test directories, assets
- Note any monorepo or workspace structure

### 3. Architecture Pattern Discovery

Analyze the codebase for patterns:

**Code Organization:**
- Frontend vs backend separation
- API route structure
- Component/module organization patterns
- Database access patterns (ORM, raw SQL, etc.)

**Authentication & Authorization:**
- Check for auth implementations
- Note auth providers or strategies

**Data Flow:**
- How data moves between frontend and backend
- API patterns (REST, GraphQL, tRPC, etc.)
- State management approach

### 4. Current State Assessment

Determine the health and completeness of the project:

**Working Features:**
- What's functional and complete?
- What's partially implemented?
- What appears broken or abandoned?

**Code Quality Signals:**
- Are there tests? What's the coverage like?
- Is there consistent error handling?
- Are there linting rules enforced?

**Documentation State:**
- Existing README or docs
- Code comments quality
- API documentation

### 5. Present Discovery Summary

Report all findings to the user in a clear format:

"Welcome {user_name}! I've scanned your existing project for {project_name}.

**Replit Environment:**
- Server: {{server_info}}
- Database: {{database_info}}
- Integrations: {{integrations_list}}
- Deployment: {{deployment_status}}

**Technology Stack:**
{{tech_stack_summary}}

**Architecture:**
{{architecture_summary}}

**Current State:**
- Working features: {{working_features_count}}
- Partial features: {{partial_features_count}}
- Code quality: {{quality_assessment}}

**Key Findings:**
{{top_findings}}

I'll now create a brownfield assessment document with these findings.

[C] Continue to assessment report generation"

### 6. Initialize Assessment Document

Copy template from `{installed_path}/brownfield-assessment-template.md` to `{output_file}`.
Fill in all discovered data from the scan.
Save the initial assessment document.

## SUCCESS METRICS:

- Replit environment properly scanned (workflows, database, env vars, deployment)
- Technology stack accurately identified with versions
- Architecture patterns discovered and documented
- Current state honestly assessed
- Assessment document initialized with real findings
- User confirms findings are accurate

## FAILURE MODES:

- Assuming technology choices without scanning files
- Missing critical dependencies or configuration
- Not checking Replit-specific resources (database, env vars)
- Skipping the user confirmation step
- Generating placeholder content instead of real findings

## NEXT STEP:

After user selects [C] to continue, load `./step-02-assess.md` to determine the optimal BMAD entry point.

Remember: Do NOT proceed to step-02 until user explicitly selects [C] and confirms the scan findings are accurate!
