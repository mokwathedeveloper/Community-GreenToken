/** @jest-environment node */

import {
  requireSuperAdmin,
  requireOrgAdmin,
  requireOrgOwner,
} from "@/lib/middleware/adminGuard";
import type { AuthContext } from "@/lib/middleware/auth";

function makeAuth(role: AuthContext["role"]): AuthContext {
  return { userId: "user-1", orgId: "org-1", role, email: "test@example.com" };
}

async function bodyOf(res: Response) {
  return res.json();
}

// ─── requireSuperAdmin ────────────────────────────────────────────────────────

describe("requireSuperAdmin()", () => {
  it("returns 401 when auth is null", async () => {
    const res = requireSuperAdmin(null)!;
    expect(res.status).toBe(401);
    const body = await bodyOf(res);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it.each(["member", "admin", "owner"] as AuthContext["role"][])(
    "returns 403 for role '%s'",
    async (role) => {
      const res = requireSuperAdmin(makeAuth(role))!;
      expect(res.status).toBe(403);
      const body = await bodyOf(res);
      expect(body.error.code).toBe("FORBIDDEN");
    }
  );

  it("returns null (allowed) for superadmin", () => {
    expect(requireSuperAdmin(makeAuth("superadmin"))).toBeNull();
  });
});

// ─── requireOrgAdmin ─────────────────────────────────────────────────────────

describe("requireOrgAdmin()", () => {
  it("returns 401 when auth is null", async () => {
    const res = requireOrgAdmin(null)!;
    expect(res.status).toBe(401);
    const body = await bodyOf(res);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 403 for member role", async () => {
    const res = requireOrgAdmin(makeAuth("member"))!;
    expect(res.status).toBe(403);
    const body = await bodyOf(res);
    expect(body.error.code).toBe("FORBIDDEN");
  });

  it.each(["admin", "owner", "superadmin"] as AuthContext["role"][])(
    "returns null (allowed) for role '%s'",
    (role) => {
      expect(requireOrgAdmin(makeAuth(role))).toBeNull();
    }
  );
});

// ─── requireOrgOwner ─────────────────────────────────────────────────────────

describe("requireOrgOwner()", () => {
  it("returns 401 when auth is null", async () => {
    const res = requireOrgOwner(null)!;
    expect(res.status).toBe(401);
    const body = await bodyOf(res);
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it.each(["member", "admin"] as AuthContext["role"][])(
    "returns 403 for role '%s'",
    async (role) => {
      const res = requireOrgOwner(makeAuth(role))!;
      expect(res.status).toBe(403);
      const body = await bodyOf(res);
      expect(body.error.code).toBe("FORBIDDEN");
    }
  );

  it.each(["owner", "superadmin"] as AuthContext["role"][])(
    "returns null (allowed) for role '%s'",
    (role) => {
      expect(requireOrgOwner(makeAuth(role))).toBeNull();
    }
  );
});
