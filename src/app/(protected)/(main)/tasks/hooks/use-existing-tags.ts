import { useTaskTags } from './queries/use-task-tags';

export function useExistingTags() {
  const { data: tags = [] } = useTaskTags();
  return tags;
}
