import TodoLists from "../components/TodoLists";

const HomePage = () => {
  return (
    <>
      <aside className="h-screen sticky top-0 w-1/5">
        <nav>
          <TodoLists />
        </nav>
      </aside>
      <div className="prose">
        <h1>Welcome</h1>
        <p>Create new todo list or select toto list from left menu</p>
      </div>
    </>
  );
};

export default HomePage;
