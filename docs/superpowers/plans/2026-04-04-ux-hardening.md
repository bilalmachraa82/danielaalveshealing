# UX & Security Hardening Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix UX bugs and security gaps identified in the CEO audit — login email, auth hardening, error boundaries, satisfaction page, and login handler safety.

**Architecture:** Targeted fixes across frontend (React) and API (Vercel serverless). No new dependencies. Each task is independent.

**Tech Stack:** React 18, TypeScript, Vercel serverless functions, Node crypto

---

### Task 1: Fix login email appearing empty (placeholder vs defaultValue)

**Files:**
- Modify: `src/pages/admin/Login.tsx:19`

- [ ] **Step 1: Change initial email state**

Change line 19 from:
```typescript
const [email, setEmail] = useState("");
```
To:
```typescript
const [email, setEmail] = useState("daniela@danielaalveshealing.com");
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/Login.tsx
git commit -m "fix: pre-fill login email to prevent browser validation error"
```

---

### Task 2: Wrap login handler in try-catch

**Files:**
- Modify: `api/auth/login.ts`

- [ ] **Step 1: Add try-catch to handler**

Replace the handler body (lines 11-31) with:

```typescript
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) {
      console.error("ADMIN_PASSWORD not configured");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const { email, password } = req.body ?? {};

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.json({
        id: "admin-1",
        email: ADMIN_EMAIL,
        name: "Daniela Alves",
        token: process.env.ADMIN_API_TOKEN ?? null,
      });
    }

    return res.status(401).json({ error: "Credenciais inválidas" });
  } catch (error) {
    console.error("Login error:", error instanceof Error ? error.message : error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
```

- [ ] **Step 2: Verify build**
- [ ] **Step 3: Commit**

---

### Task 3: Use timing-safe token comparison in auth

**Files:**
- Modify: `api/_auth.ts`

- [ ] **Step 1: Replace string comparison with timingSafeEqual**

```typescript
import type { VercelRequest } from "@vercel/node";
import { timingSafeEqual } from "crypto";

export function verifyAdmin(req: VercelRequest): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  const adminToken = process.env.ADMIN_API_TOKEN;
  if (!adminToken) return false;
  if (token.length !== adminToken.length) return false;
  return timingSafeEqual(Buffer.from(token), Buffer.from(adminToken));
}
```

- [ ] **Step 2: Verify build**
- [ ] **Step 3: Commit**

---

### Task 4: Add React Error Boundary to AdminLayout

**Files:**
- Create: `src/components/admin/layout/ErrorBoundary.tsx`
- Modify: `src/components/admin/layout/AdminLayout.tsx`

- [ ] **Step 1: Create ErrorBoundary component**

```tsx
import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
          <h2 className="font-serif text-2xl">Algo correu mal</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recarregar página
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: Wrap AdminLayout Outlet with ErrorBoundary**

In AdminLayout.tsx, import ErrorBoundary and wrap `<Outlet />`:

```tsx
import { ErrorBoundary } from "./ErrorBoundary";
// ... inside return:
<ErrorBoundary>
  <Outlet />
</ErrorBoundary>
```

- [ ] **Step 3: Verify build**
- [ ] **Step 4: Commit**

---

### Task 5: Create dedicated Satisfaction page

**Files:**
- Create: `src/pages/admin/SatisfactionList.tsx`
- Modify: `src/App.tsx:101`

- [ ] **Step 1: Create SatisfactionList page**

A page that shows satisfaction survey responses with NPS scores and filters.

- [ ] **Step 2: Update route in App.tsx**

Change line 101 from:
```tsx
<Route path="satisfacao" element={<Dashboard />} />
```
To lazy-loaded SatisfactionList component.

- [ ] **Step 3: Verify build and all routes**
- [ ] **Step 4: Commit**

---

### Task 6: Fix dashboard inbox_id validation

**Files:**
- Modify: `api/dashboard/index.ts:202`

- [ ] **Step 1: Add UUID validation for inbox_id**

Add UUID regex validation before using inbox_id in SQL query.

- [ ] **Step 2: Verify build**
- [ ] **Step 3: Commit**
