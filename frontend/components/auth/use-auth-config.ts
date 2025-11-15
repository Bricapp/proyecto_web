"use client";

import { useQuery } from "@tanstack/react-query";

import { AuthConfig, fetchAuthConfig } from "@/lib/api";

type UseAuthConfigOptions = {
  enabled?: boolean;
};

export function useAuthConfig(options: UseAuthConfigOptions = {}) {
  const { enabled = true } = options;

  return useQuery<AuthConfig, Error>({
    queryKey: ["auth-config"],
    queryFn: fetchAuthConfig,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    enabled
  });
}
