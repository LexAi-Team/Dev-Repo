# LEXCONNECT — PERMANENT DEVELOPMENT RULES

1. Use Firebase MCP for Firebase Auth/configuration, PostgreSQL MCP for live schema/data/migrations, and TestSprite MCP for functional + regression testing.

2. Treat working systems as FROZEN by default: Firebase Auth, Google/Email Login, Landing Page, AppShell, dashboards, LexAI, existing APIs, Prisma connection, and existing AI context must not be rewritten.

3. Before modifying anything, AUDIT the existing code, routes, components, APIs, Prisma schema, and live PostgreSQL database. Never assume something does not exist.

4. REUSE existing services, components, layouts, APIs, and AI infrastructure wherever possible. Extend existing functionality instead of creating duplicates.

5. Never create a second Firebase initialization, authentication system, AI provider, LexAI client, AppShell, Sidebar, Topbar, or dashboard layout.

6. Firebase UID is the identity source of truth: Firebase ID Token → Firebase Admin verification → Firebase UID → PostgreSQL User. Never trust userId, role, or ownership information supplied by the frontend.

7. PostgreSQL is the application-data source of truth. Never use mock data when real backend/database functionality exists. Use proper empty states when no data exists.

8. Before changing Prisma/database structure, inspect the LIVE PostgreSQL schema using PostgreSQL MCP. Never reset, delete, truncate, or overwrite existing data.

9. Every user-owned resource must enforce backend ownership checks. User A must never access User B's data by changing IDs in requests.

10. Follow STRICT CHANGE SCOPE: modify only files required for the requested feature. Do not perform unrelated refactoring, renaming, restructuring, or cleanup.

11. For AI features, reuse the existing LexAIService and infrastructure. Create isolated prompts/services for new features without changing existing AI Assistant behavior.

12. For UI changes, inspect parent layouts first. Follow the existing design system and never introduce duplicate AppShell, Sidebar, Topbar, navigation, authentication guards, or nested application shells.

13. Every new feature must include loading, empty, error, validation, unauthorized, and failure states. Never expose API keys, database credentials, Firebase Admin credentials, stack traces, or internal errors.

14. Implement in this order:
AUDIT → DESIGN → DATABASE → BACKEND → FRONTEND → INTEGRATION → DATABASE VERIFICATION → TESTSPRITE TESTING → REGRESSION TESTING → BUILD VERIFICATION.

15. After implementation, verify live data using PostgreSQL MCP, authentication/configuration using Firebase MCP where relevant, and execute TestSprite functional and regression tests. Do not claim success based only on lint/build.

16. Run:
frontend lint
frontend build
backend build
plus relevant TestSprite tests.

17. Mandatory regression checks after every major feature:
Firebase Auth, Google Login, Email Login, Logout, existing Dashboard, existing AI Assistant, LexAI context, existing APIs, and existing navigation.

18. If an existing feature breaks, STOP feature development and fix the regression before continuing.

19. Do not claim PASS unless the functionality has actually been tested. Clearly report failures and known limitations.

20. At completion, provide:
FILES CREATED → FILES MODIFIED → FILES UNTOUCHED → DATABASE CHANGES → API CHANGES → AI CHANGES → MCP VERIFICATION → TESTSPRITE RESULTS → REGRESSION RESULTS → BUILD RESULTS → KNOWN LIMITATIONS.
