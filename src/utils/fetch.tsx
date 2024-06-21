import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Params } from "../components/Tasks";

const API = "https://667304ee6ca902ae11b2d189.mockapi.io/api/v1/";
export const TASK_LISTS_API = `${API}task-lists/`;
export const TASKS_API = `${API}tasks`;

const useTodoMutations = (selectedListId: string, params: Params) => {
  const queryClient = useQueryClient();

  const onSuccesCallback = () => {
    queryClient.invalidateQueries({
      queryKey: ["todos", params, selectedListId],
    });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`${TASK_LISTS_API}${selectedListId}/tasks/${id}`),
    onSuccess: onSuccesCallback,
  });

  const completedMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      axios.put(`${TASK_LISTS_API}${selectedListId}/tasks/${id}`, {
        completed,
      }),
    onSuccess: onSuccesCallback,
  });

  return { deleteMutation, completedMutation };
};

export default useTodoMutations;
