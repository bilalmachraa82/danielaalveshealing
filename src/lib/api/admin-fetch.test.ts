import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_AUTH_KEY,
  ADMIN_UNAUTHORIZED_EVENT,
  AdminUnauthorizedError,
  adminFetch,
} from "./admin-fetch";

describe("adminFetch", () => {
  beforeEach(() => {
    localStorage.setItem(
      ADMIN_AUTH_KEY,
      JSON.stringify({
        id: "admin-1",
        email: "daniela@example.com",
        name: "Daniela",
        token: "secret-token",
      })
    );
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("sends the bearer token from stored admin auth", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await adminFetch<{ ok: boolean }>("/api/dashboard/stats");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/dashboard/stats",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer secret-token",
          "Content-Type": "application/json",
        }),
      })
    );
  });

  it("dispatches an unauthorized event and throws a typed error on 401", async () => {
    const onUnauthorized = vi.fn();
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized as EventListener);

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(adminFetch("/api/clients")).rejects.toBeInstanceOf(
      AdminUnauthorizedError
    );
    expect(onUnauthorized).toHaveBeenCalledTimes(1);

    window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized as EventListener);
  });

  it("throws with server error message on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Database connection failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    await expect(adminFetch("/api/broken")).rejects.toThrow("Database connection failed");
  });

  it("returns parsed JSON body on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "abc", name: "Test" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    const result = await adminFetch<{ id: string; name: string }>("/api/resource");
    expect(result).toEqual({ id: "abc", name: "Test" });
  });

  it("sends Content-Type application/json even without a stored token", async () => {
    localStorage.clear();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await adminFetch("/api/test");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/test",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
      })
    );
  });
});
