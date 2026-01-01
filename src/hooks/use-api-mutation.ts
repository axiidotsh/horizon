import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { toast } from 'sonner';

type ClientResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEndpoint = (args: any) => Promise<ClientResponse>;

export function useApiMutation<TEndpoint extends AnyEndpoint>(
  endpoint: TEndpoint,
  options?: {
    mutationKey?: QueryKey;
    invalidateKeys?: QueryKey[];
    onSuccess?: (data: InferResponseType<TEndpoint>) => void;
    onError?: (error: Error) => void;
    errorMessage?: string;
    optimisticUpdate?: {
      queryKey: QueryKey;
      updater: (
        oldData: unknown,
        variables: InferRequestType<TEndpoint>
      ) => unknown;
    };
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: options?.mutationKey,
    mutationFn: async (input: InferRequestType<TEndpoint>) => {
      const res = await endpoint(input);
      if (!res.ok) {
        const error = await res.json();
        const errorMsg =
          (error as { error?: string }).error || 'Request failed';
        const rateLimitError = new Error(errorMsg);
        (rateLimitError as Error & { status: number }).status = res.status;
        throw rateLimitError;
      }
      return res.json() as Promise<InferResponseType<TEndpoint>>;
    },
    onMutate: async (variables) => {
      if (options?.optimisticUpdate) {
        await queryClient.cancelQueries({
          queryKey: options.optimisticUpdate.queryKey,
        });

        const previousData = queryClient.getQueryData(
          options.optimisticUpdate.queryKey
        );

        queryClient.setQueryData(
          options.optimisticUpdate.queryKey,
          (old: unknown) => options.optimisticUpdate!.updater(old, variables)
        );

        return { previousData };
      }
      return {};
    },
    onSuccess: (data) => {
      options?.invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      options?.onSuccess?.(data);
    },
    onError: (error: Error & { status?: number }, _variables, context) => {
      if (options?.optimisticUpdate && context?.previousData !== undefined) {
        queryClient.setQueryData(
          options.optimisticUpdate.queryKey,
          context.previousData
        );
      }

      const isRateLimitError = error.status === 429;
      const errorMessage = isRateLimitError
        ? error.message
        : options?.errorMessage || error.message || 'An error occurred';

      toast.error(errorMessage);
      options?.onError?.(error);
    },
  });
}
