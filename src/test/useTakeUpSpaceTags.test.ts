import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useDeleteTag,
  useSaveTags,
  useSeedDefaultTags,
  useTakeUpSpaceTags,
} from "@/hooks/useTakeUpSpaceTags";
import type { TakeUpSpaceTag } from "@/types/takeUpSpace";

const { mockOrder, mockInsert, mockSingle, mockDelete } = vi.hoisted(() => ({
  mockOrder: vi.fn(),
  mockInsert: vi.fn(),
  mockSingle: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/lib/supabase", () => {
  const builder: Record<string, unknown> = {};
  builder.select = () => builder;
  builder.eq = () => builder;
  builder.order = mockOrder;
  builder.insert = () => ({
    then: (r: (v: unknown) => void, j: (e: unknown) => void) =>
      mockInsert().then(r, j),
  });
  builder.upsert = () => ({ select: () => ({ single: mockSingle }) });
  const deleteBuilder: Record<string, unknown> = {};
  deleteBuilder.eq = () => deleteBuilder;
  deleteBuilder.then = (r: (v: unknown) => void, j: (e: unknown) => void) =>
    mockDelete().then(r, j);
  builder.delete = () => deleteBuilder;
  return { supabase: { from: () => builder } };
});

const TAG: TakeUpSpaceTag = {
  id: "t-1",
  user_id: "user-1",
  name: "work",
  is_default: true,
  active: true,
  created_at: "2026-05-29T00:00:00Z",
};

const INACTIVE_TAG: TakeUpSpaceTag = {
  id: "t-2",
  user_id: "user-1",
  name: "settling",
  is_default: true,
  active: false,
  created_at: "2026-05-29T00:00:00Z",
};

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return React.createElement(QueryClientProvider, { client }, children);
}

beforeEach(() => vi.clearAllMocks());

describe("useTakeUpSpaceTags", () => {
  it("returns all tags including inactive", async () => {
    mockOrder.mockResolvedValue({ data: [TAG, INACTIVE_TAG], error: null });

    const { result } = renderHook(() => useTakeUpSpaceTags("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([TAG, INACTIVE_TAG]);
  });

  it("returns empty array when no tags exist", async () => {
    mockOrder.mockResolvedValue({ data: [], error: null });

    const { result } = renderHook(() => useTakeUpSpaceTags("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });

  it("throws on error", async () => {
    mockOrder.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const { result } = renderHook(() => useTakeUpSpaceTags("user-1"), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("does not run when userId is empty", () => {
    const { result } = renderHook(() => useTakeUpSpaceTags(""), { wrapper });

    expect(result.current.fetchStatus).toBe("idle");
    expect(mockOrder).not.toHaveBeenCalled();
  });
});

describe("useSeedDefaultTags", () => {
  it("resolves without throwing on success", async () => {
    mockInsert.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useSeedDefaultTags("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws on error", async () => {
    mockInsert.mockResolvedValue({ error: { message: "DB error" } });

    const { result } = renderHook(() => useSeedDefaultTags("user-1"), {
      wrapper,
    });

    await act(async () => {
      result.current.mutate();
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useSaveTags", () => {
  it("resolves to the saved tag", async () => {
    mockSingle.mockResolvedValue({ data: TAG, error: null });

    const { result } = renderHook(() => useSaveTags("user-1"), { wrapper });

    let resolved: TakeUpSpaceTag | undefined;
    await act(async () => {
      resolved = await result.current.mutateAsync({
        id: "t-1",
        name: "work",
        is_default: true,
        active: true,
      });
    });

    expect(resolved).toEqual(TAG);
  });

  it("throws on error", async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "DB error" },
    });

    const { result } = renderHook(() => useSaveTags("user-1"), { wrapper });

    await act(async () => {
      result.current.mutate({
        id: "t-1",
        name: "work",
        is_default: true,
        active: true,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useDeleteTag", () => {
  it("resolves without throwing on success", async () => {
    mockDelete.mockResolvedValue({ error: null });

    const { result } = renderHook(() => useDeleteTag("user-1"), { wrapper });

    await act(async () => {
      result.current.mutate("t-1");
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("throws on error", async () => {
    mockDelete.mockResolvedValue({ error: { message: "DB error" } });

    const { result } = renderHook(() => useDeleteTag("user-1"), { wrapper });

    await act(async () => {
      result.current.mutate("t-1");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
