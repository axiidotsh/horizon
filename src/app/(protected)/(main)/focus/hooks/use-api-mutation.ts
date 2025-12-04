import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { toast } from 'sonner';

type ClientResponse = { ok: boolean; json: () => Promise<unknown> };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEndpoint = (args: any) => Promise<ClientResponse>;

export function useApiMutation<TEndpoint extends AnyEndpoint>(
  endpoint: TEndpoint,
  options?: {
    invalidateKeys?: QueryKey[];
    onSuccess?: (data: InferResponseType<TEndpoint>) => void;
    onError?: (error: Error) => void;
    errorMessage?: string;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InferRequestType<TEndpoint>) => {
      const res = await endpoint(input);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          (error as { error?: string }).error || 'Request failed'
        );
      }
      return res.json() as Promise<InferResponseType<TEndpoint>>;
    },
    onSuccess: (data) => {
      options?.invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      toast.error(
        options?.errorMessage || error.message || 'An error occurred'
      );
      options?.onError?.(error);
    },
  });
}
