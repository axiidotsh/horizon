import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';
import type { InferRequestType, InferResponseType } from 'hono/client';
import { toast } from 'sonner';

type ClientResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyEndpoint = (args?: any) => Promise<ClientResponse>;

export function useApiInfiniteQuery<TEndpoint extends AnyEndpoint>(
  endpoint: TEndpoint,
  options: {
    queryKey: QueryKey;
    getInput: (
      offset: number,
      baseInput?: Omit<InferRequestType<TEndpoint>, 'query'>
    ) => InferRequestType<TEndpoint>;
    enabled?: boolean;
    errorMessage?: string;
  }
) {
  const { queryKey, getInput, enabled, errorMessage } = options;

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam: number }) => {
      const input = getInput(pageParam);
      const res = await endpoint(input);

      if (!res.ok) {
        const error = await res.json();
        const errorMsg =
          (error as { error?: string }).error ||
          errorMessage ||
          'Request failed';

        if (res.status === 429) {
          toast.error(errorMsg);
        }

        throw new Error(errorMsg);
      }

      return res.json() as Promise<InferResponseType<TEndpoint>>;
    },
    getNextPageParam: (lastPage) =>
      (lastPage as { nextOffset: number | null }).nextOffset ?? undefined,
    initialPageParam: 0,
    enabled,
  });
}
