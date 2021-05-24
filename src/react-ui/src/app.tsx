import { useStoredState } from "./hooks/use-stored-state.js";

export const App: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [dateStore, setDateStore] = useStoredState(
    { date: 0 },
    {
      async getAllState() {
        return {
          date: await window.SessionInvoker.getState("date") as number,
        };
      },
      getState(key) {
        return window.SessionInvoker.getState(key) as Promise<number>;
      },
      setState(key, value) {
        return window.SessionInvoker.setState(key, value);
      },
    }
  );
  return (
    <div>
      <h1 className="extension-title">Hello, React UI with CDN!</h1>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        use react hooks! count = {count}
      </button>
      <p>
        Don't worry if the following shows "error". The error message will come
        out randomly by design.
      </p>
      <p>{+dateStore.date}</p>
      <button
        onClick={async () => {
          try {
            const result = await window.SessionInvoker.logInput(
              `Current count in React UI is ${count}!`
            );
            console.log("returned message", result);
            setDateStore("date", +new Date());
          } catch (e) {
            console.error(e);
          }
        }}
      >
        send count to extension
      </button>
      <iframe src="http://localhost:8080" title="if"></iframe>
    </div>
  );
};
