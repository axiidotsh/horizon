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

type OptimisticUpdateContext = {
  snapshots: Array<{
    queryKey: QueryKey;
    data: unknown;
  }>;
};

export function useApiMutation<
  TEndpoint extends AnyEndpoint,
  TContext extends OptimisticUpdateContext = OptimisticUpdateContext,
>(
  endpoint: TEndpoint,
  options?: {
    mutationKey?: QueryKey;
    invalidateKeys?: QueryKey[];
    onSuccess?: (
      data: InferResponseType<TEndpoint>,
      variables: InferRequestType<TEndpoint>
    ) => void;
    onError?: (
      error: Error,
      variables: InferRequestType<TEndpoint>,
      context?: TContext
    ) => void;
    errorMessage?: string;
    successMessage?: string;
    successAction?: {
      label: string;
      onClick: (
        data: InferResponseType<TEndpoint>,
        variables: InferRequestType<TEndpoint>
      ) => void | Promise<unknown>;
    };
    onMutate?: (
      variables: InferRequestType<TEndpoint>
    ) => Promise<TContext | void> | TContext | void;
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
    onMutate: options?.onMutate,
    onSuccess: (data, variables) => {
      options?.invalidateKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      if (options?.successMessage) {
        toast.success(options.successMessage, {
          ...(options.successAction && {
            action: {
              label: options.successAction.label,
              onClick: async () => {
                await options.successAction!.onClick(data, variables);
                options.invalidateKeys?.forEach((key) => {
                  queryClient.invalidateQueries({ queryKey: key });
                });
              },
            },
          }),
        });
      }
      options?.onSuccess?.(data, variables);
    },
    onError: (error: Error & { status?: number }, variables, context) => {
      const isRateLimitError = error.status === 429;
      const errorMessage = isRateLimitError
        ? error.message
        : options?.errorMessage || error.message || 'An error occurred';

      toast.error(errorMessage);
      options?.onError?.(error, variables, context as TContext | undefined);
    },
  });
}
