export const App: React.FC = () => {
  const [count, setCount] = React.useState(0);
  const [message, setMessage] = React.useState("");
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
      <p>Don't worry if the following shows "error". The error message will come out randomly by design.</p>
      <p>{message}</p>
      <button
        onClick={async () => {
          try {
            const result = await window.extensionAPI.logInput(
              `Current count in React UI is ${count}!`
            );
            setMessage(result);
          } catch (error) {
            setMessage("error when call extensionAPI:" + JSON.stringify(error));
          }
        }}
      >
        send count to extension
      </button>
    </div>
  );
};
