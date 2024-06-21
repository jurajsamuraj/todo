import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TASKS_API } from "../utils/fetch";

type Inputs = {
  title: string;
  description?: string;
  deadline?: string;
};

type FormProps = {
  selectedListId: string;
};

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  deadline: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val).toLocaleString("sk-SK") : "")),
});

const Form = ({ selectedListId }: FormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (newTodo: Inputs) =>
      axios.post(TASKS_API, {
        ...newTodo,
        completed: false,
        ["task-listId"]: selectedListId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["todos"],
      });
    },
  });

  const onSubmit: SubmitHandler<Inputs> = (data: Inputs) => {
    mutation.mutate(data);
  };

  return (
    <div className="w-1/3">
      <p>Add new task</p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        <input
          className="input input-bordered"
          {...register("title")}
          placeholder="title"
        />
        {errors.title && <p>{errors.title.message as string}</p>}

        <textarea
          className="textarea input-bordered"
          {...register("description")}
          placeholder="description"
        />

        <input
          className="input input-bordered"
          type="datetime-local"
          defaultValue="test"
          {...register("deadline")}
          placeholder="deadline"
        />

        <input className="btn" type="submit" disabled={mutation.isPending} />
      </form>
    </div>
  );
};

export default Form;
