import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { TASK_LISTS_API } from "../utils/fetch";
import { useNavigate } from "react-router-dom";
import TaskItem from "./TaskItem";

export type Task = {
  id: string;
  title: string;
  deadline?: string;
  completed: boolean;
  description: string;
  ["task-listId"]: string;
};

export type Params = {
  search?: string;
  completed?: boolean;
};

type TasksProps = {
  selectedListId: string;
};

const queryFn = (params: Params, selectedListId: string) =>
  axios
    .get(`${TASK_LISTS_API}${selectedListId}/tasks`, {
      params,
    })
    .then(({ data }: AxiosResponse<Task[]>) => data)
    .catch(() => []);

const Tasks = ({ selectedListId }: TasksProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params, setParams] = useState<Params>({});
  const debouncedParamsChange = useDebouncedCallback((value: string) => {
    setParams((prev) => ({ ...prev, search: value }));
  }, 500);

  const {
    data: todos,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["todos", params, selectedListId],
    queryFn: () => queryFn(params, selectedListId),
    retry: false,
  });

  const deleteAllMutation = useMutation({
    mutationFn: () => {
      const getDeletePromises = (deleteTodos?: Task[]) => {
        if (deleteTodos?.length) {
          const deletePromises = deleteTodos?.map((todo) =>
            axios.delete(`${TASK_LISTS_API}${selectedListId}/tasks/${todo.id}`)
          );

          return Promise.all(deletePromises).then(() =>
            axios.delete(`${TASK_LISTS_API}${selectedListId}`)
          );
        }
        return axios.delete(`${TASK_LISTS_API}${selectedListId}`);
      };

      // when no search and no filter
      if (!params.search?.length && params.completed === undefined) {
        return getDeletePromises(todos);
      }

      // when search or filter is applied first find all tasks and then delete
      return axios
        .get(`${TASK_LISTS_API}${selectedListId}/tasks`)
        .then(({ data }: AxiosResponse<Task[]>) => {
          return getDeletePromises(data);
        });
    },
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: ["todo-lists"],
        })
        .then(() => {
          navigate("/");
        });
    },
  });

  const searchChangeHandler = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    debouncedParamsChange(target.value);
  };

  const onActiveCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setParams((prev) => ({
      ...prev,
      completed: event.target.checked ? false : undefined,
    }));
  };

  const onCompletedCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setParams((prev) => ({
      ...prev,
      completed: event.target.checked ? true : undefined,
    }));
  };

  return (
    <div className="flex flex-col gap-4 w-1/2">
      <button
        className="btn btn-accent absolute right-1"
        onClick={() => deleteAllMutation.mutate()}
      >
        Delete list
      </button>
      <div>
        <label className="input input-bordered flex items-center gap-2">
          <input
            type="text"
            className="grow"
            placeholder="Search"
            onChange={searchChangeHandler}
            disabled={isLoading}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className="w-4 h-4 opacity-70"
          >
            <path
              fillRule="evenodd"
              d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
              clipRule="evenodd"
            />
          </svg>
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Active</span>
          <input
            disabled={isLoading || params?.completed}
            type="checkbox"
            className="checkbox"
            onChange={onActiveCheckboxChange}
          />
        </label>
        <label className="label cursor-pointer">
          <span className="label-text">Completed</span>
          <input
            disabled={isLoading || params?.completed === false}
            type="checkbox"
            className="checkbox"
            onChange={onCompletedCheckboxChange}
          />
        </label>
      </div>
      {isError || todos?.length === 0 ? (
        <p>
          No{" "}
          {params.completed
            ? "completed"
            : params.completed === false
            ? "active"
            : ""}{" "}
          tasks
        </p>
      ) : isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul className="list-none flex flex-col gap-2">
          {todos?.map((todo) => (
            <TaskItem
              task={todo}
              selectedListId={selectedListId}
              params={params}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tasks;
