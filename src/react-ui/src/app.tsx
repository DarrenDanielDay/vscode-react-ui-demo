import React, { useEffect, useState } from "react";
import { Button, CircularProgress } from "@material-ui/core";
import { useStoredState } from "./hooks/use-stored-state";

function delay(seconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}

export const App: React.FC = () => {
  const [count, setCount] = useState(0);
  const [dateStore, setDateStore, loading] = useStoredState(
    { date: new Date().toString() },
    {
      async getAllState() {
        // Suppose getting states from extension takes some time
        await delay(1);
        return {
          date: (await window.SessionInvoker.getState("date")) as string,
        };
      },
      async getState(key): Promise<string> {
        // Suppose getting states from extension takes some time
        await delay(1);
        const extensionState = (await window.SessionInvoker.getState(key)) as
          | string
          | null;
        return extensionState ?? dateStore.date;
      },
      async setState(key, value) {
        return window.SessionInvoker.setState(key, value);
      },
    }
  );
  useEffect(() => {
    const handler = (message: string) => {
      console.log("UI", message);
    };
    window.SessionHubs.on("chat", handler);
    return () => {
      window.SessionHubs.off("chat", handler);
    };
  }, []);
  return (
    <div>
      <h1 className="extension-title">Hello, React UI {"&"} ESbuild!</h1>
      <button
        onClick={() => {
          setCount(count + 1);
        }}
      >
        use react hooks! count = {count}
      </button>
      <button
        onClick={async () => {
          try {
            const result = await window.SessionInvoker.logInput(
              `Current count in React UI is ${count}!`
            );
            console.log("returned message", result);
          } catch (e) {
            console.error(e);
          }
        }}
      >
        send count to extension
      </button>
      <p>
        The following is a state saved by extension (Here we used a Date string
        for example).
      </p>
      <p>
        {dateStore.date}
        {loading && <CircularProgress />}
      </p>
      <p>
        This state is avaliable until the extension is deactivated (can be
        recovered if you close the webview panel and then open it).
      </p>
      <button
        onClick={() => {
          setDateStore("date", new Date().toString());
        }}
      >
        store current date to extension session level
      </button>

      <p>
        You can also install any third-party <code>npm</code> packages avaliable
        in browser for the UI sub-project, such as{" "}
        <code>@material-ui/core</code>.
      </p>
      <Button
        color="primary"
        onClick={() => {
          window.SessionHubs.emit("chat", "UI dispatched!");
        }}
      >
        Click Material UI Button to dispatch event
      </Button>
    </div>
  );
};
