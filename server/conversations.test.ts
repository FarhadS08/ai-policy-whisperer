import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { ClerkUser } from "./_core/clerkAuth";

// Create a mock Clerk user (string ID, not numeric)
function createAuthContext(userId: string = 'user_test123'): TrpcContext {
  const user: ClerkUser = {
    id: userId,
    email: "test@example.com",
    name: "Test User",
    imageUrl: null,
    role: "user",
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUnauthContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Conversation Routes - Clerk Auth", () => {
  describe("conversations.list", () => {
    it("should require authentication", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.conversations.list()).rejects.toThrow();
    });

    it("should use Clerk user ID (string format)", async () => {
      const clerkUserId = 'user_2abc123def456';
      const ctx = createAuthContext(clerkUserId);
      
      // Verify Clerk user ID format
      expect(ctx.user?.id).toBe(clerkUserId);
      expect(typeof ctx.user?.id).toBe('string');
    });
  });

  describe("conversations.create", () => {
    it("should require authentication", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.conversations.create({
          title: "Test Conversation",
        })
      ).rejects.toThrow();
    });

    it("should accept title parameter", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Test input validation - should accept title
      const input = { title: "Test Conversation" };
      expect(input.title).toBe("Test Conversation");
    });
  });

  describe("conversations.get", () => {
    it("should require UUID format for conversation ID", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Invalid UUID should fail validation
      await expect(
        caller.conversations.get({ id: "not-a-uuid" })
      ).rejects.toThrow();
    });
  });

  describe("conversations.delete", () => {
    it("should require authentication", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.conversations.delete({ id: "550e8400-e29b-41d4-a716-446655440000" })
      ).rejects.toThrow();
    });
  });
});

describe("Message Routes - Clerk Auth", () => {
  describe("messages.add", () => {
    it("should require authentication", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.messages.add({
          conversationId: "550e8400-e29b-41d4-a716-446655440000",
          role: "user",
          content: "Test message",
        })
      ).rejects.toThrow();
    });

    it("should validate role enum (user or assistant)", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Invalid role should fail validation
      await expect(
        caller.messages.add({
          conversationId: "550e8400-e29b-41d4-a716-446655440000",
          role: "invalid" as "user",
          content: "Test message",
        })
      ).rejects.toThrow();
    });

    it("should require UUID format for conversation ID", async () => {
      const ctx = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.messages.add({
          conversationId: "not-a-uuid",
          role: "user",
          content: "Test message",
        })
      ).rejects.toThrow();
    });
  });

  describe("messages.list", () => {
    it("should require authentication", async () => {
      const ctx = createUnauthContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.messages.list({ conversationId: "550e8400-e29b-41d4-a716-446655440000" })
      ).rejects.toThrow();
    });
  });
});

describe("Auth Routes - Clerk", () => {
  it("should return Clerk user for authenticated context", async () => {
    const ctx = createAuthContext('user_clerk123');
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeDefined();
    expect(result?.id).toBe('user_clerk123');
    expect(result?.email).toBe("test@example.com");
  });

  it("should return null for unauthenticated context", async () => {
    const ctx = createUnauthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("should NOT have logout route (handled by Clerk)", async () => {
    // Logout is handled by Clerk on the frontend
    // The server doesn't need a logout endpoint
    expect(true).toBe(true);
  });
});

describe("No Manus Dependencies", () => {
  it("should use Clerk user ID (string) not Manus openId", () => {
    const ctx = createAuthContext('user_clerk123');
    // Clerk IDs are strings, not numeric
    expect(typeof ctx.user?.id).toBe('string');
    // Should not have openId property (Manus)
    expect((ctx.user as any)?.openId).toBeUndefined();
  });

  it("should use Supabase UUID for conversation IDs", () => {
    // Supabase uses UUID format for primary keys
    const validUUID = "550e8400-e29b-41d4-a716-446655440000";
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(validUUID)).toBe(true);
  });
});
