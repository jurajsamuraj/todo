import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";
import { Task } from "./Tasks";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Link, useParams } from "react-router-dom";

type NewTodoListInputs = {
  title: string;
};

const schema = z.object({
  title: z.string().min(1, "Title is required"),
});

const TodoLists = () => {
  const { id: selectedListId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewTodoListInputs>({
    resolver: zodResolver(schema),
  });

  const queryClient = useQueryClient();

  const {
    data: todoLists,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["todo-lists"],
    queryFn: () =>
      axios
        .get("https://667304ee6ca902ae11b2d189.mockapi.io/api/v1/task-lists")
        .then(({ data }: AxiosResponse<Task[]>) => data),
    retry: false,
  });

  const newListMutation = useMutation({
    mutationFn: (data: NewTodoListInputs) =>
      axios.post(
        "https://667304ee6ca902ae11b2d189.mockapi.io/api/v1/task-lists",
        {
          ...data,
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todo-lists"],
      });
    },
  });

  const onSubmit: SubmitHandler<NewTodoListInputs> = (data) => {
    newListMutation.mutate(data);
  };

  return (
    <div className="flex flex-col h-screen gap-1 bg-base-200">
      <ul className="menu  grow flex gap-1">
        <li className="menu-title">Todo Lists</li>
        {isLoading ? (
          <p>
            <span className="loading loading-ring loading-xs"></span>
          </p>
        ) : isError ? (
          <>Loading of todolists failed</>
        ) : (
          todoLists?.map((list) => (
            <li className="flex flex-row" key={list.id}>
              <Link
                className={
                  "bg-base-300 flex-grow" +
                  (list.id === selectedListId ? " active" : "")
                }
                to={`/task/${list.id}`}
              >
                {list.title}
              </Link>
              {/*  <button
                className={
                  "bg-base-300 flex-grow" +
                  (list.id === selectedListId ? " active" : "")
                }
                onClick={() => onListSelect(list.id)}
              >
                {list.title}
              </button> */}
            </li>
          ))
        )}
      </ul>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex gap-1 pb-1 pl-1">
          <input
            className="input input-sm input-bordered grow"
            type="text"
            placeholder="New list title"
            {...register("title")}
          />
          <button
            className="btn btn-sm btn-secondary"
            title="Add new todo-list"
          >
            +
          </button>
        </div>
        {errors.title && (
          <p className="text-red-700">{errors.title.message as string}</p>
        )}
      </form>
    </div>
  );
};

export default TodoLists;
