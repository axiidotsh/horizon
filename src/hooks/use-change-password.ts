import { api } from '@/lib/rpc';
import { useApiMutation } from './use-api-mutation';

export function useChangePassword() {
  return useApiMutation(api.user['change-password'].$post);
}
