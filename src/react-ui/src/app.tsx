import React, { useState } from "react";
import { Button } from "@material-ui/core";
import { useStoredState } from "./hooks/use-stored-state";

export const App: React.FC = () => {
  const [count, setCount] = useState(0);
  const [dateStore, setDateStore] = useStoredState(
    { date: new Date().toString() },
    {
      async getAllState() {
        return {
          date: (await window.SessionInvoker.getState("date")) as string,
        };
      },
      getState(key) {
        return window.SessionInvoker.getState(key) as Promise<string>;
      },
      setState(key, value) {
        return window.SessionInvoker.setState(key, value);
      },
    }
  );
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
      <p>
        Extension saved state (Here we used a Date string for example),
        avaliable until when the extension is deactivated.
      </p>
      <p>{dateStore.date}</p>
      <button
        onClick={async () => {
          try {
            const result = await window.SessionInvoker.logInput(
              `Current count in React UI is ${count}!`
            );
            console.log("returned message", result);
            setDateStore("date", new Date().toString());
          } catch (e) {
            console.error(e);
          }
        }}
      >
        send count to extension
      </button>
      <p>
        You can also install any third-party <code>npm</code> packages avaliable
        in browser for the UI sub-project, such as{" "}
        <code>@material-ui/core</code>.
      </p>
      <Button color="primary">This is a Material UI Button</Button>
    </div>
  );
};
