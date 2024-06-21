import Form from "../components/Form";
import Tasks from "../components/Tasks";
import { useParams } from "react-router";
import TodoLists from "../components/TodoLists";

const ListPage = () => {
  const { id } = useParams();

  return (
    <>
      <aside className="h-screen sticky top-0 w-1/5">
        <nav>
          <TodoLists />
        </nav>
      </aside>
      <main className="w-4/5">
        <div className="flex gap-8 pt-1 relative">
          <Tasks selectedListId={id || ""} />
          <Form selectedListId={id || ""} />
        </div>
      </main>
    </>
  );
};

export default ListPage;
