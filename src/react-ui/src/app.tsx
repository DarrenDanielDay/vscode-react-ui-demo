import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  colors,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core";
import { useStoredState } from "./hooks/use-stored-state";
import logo from "./logo.svg";
import github from "./github.jpg";
import styles from "./index.module.css";

function delay(seconds: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, seconds * 1000);
  });
}
const theme = createMuiTheme({
  palette: {
    primary: colors.lightBlue,
    secondary: colors.pink,
  },
});

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
    <ThemeProvider theme={theme}>
      <div className={styles.App}>
        <header className={styles["App-header"]}>
          <img src={logo} className={styles["App-logo"]} alt="logo" />
          <a
            href="https://github.com/DarrenDanielDay/vscode-react-ui-demo"
            className={styles["github-link"]}
          >
            <img src={github} className={styles.github} alt="github" />
          </a>
          <p>
            Edit <code>src/react-ui/src/app.tsx</code> and save to reload.
          </p>
          <a
            className={styles["App-link"]}
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <p>
            You can install any third-party <code>npm</code> packages avaliable
            in browser for the UI sub-project, such as{" "}
            <code>@material-ui/core</code>.
          </p>
          <div
            style={{
              display: "flex",
              width: "600px",
              height: "50px",
              justifyContent: "space-around",
              alignItems: "center",
            }}
          >
            <Button
              color="primary"
              variant="outlined"
              onClick={() => {
                setCount(count + 1);
              }}
            >
              use react hooks! count = {count}
            </Button>
            <Button
              color="secondary"
              variant="outlined"
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
            </Button>
          </div>
          <p>
            The following is a state saved by extension (Here we used a Date
            string for example).
          </p>
          <p>{loading ? <CircularProgress /> : dateStore.date || "null"}</p>
          <p>
            This state is avaliable until the extension is deactivated (can be
            recovered if you close the webview panel and then open it).
          </p>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              setDateStore("date", new Date().toString());
            }}
          >
            store current date to extension session level
          </Button>
          <p>
            Here are also some convenient APIs for attaching to events of
            extension.
          </p>
          <Button
            color="primary"
            variant="contained"
            onClick={() => {
              window.SessionHubs.emit("chat", "UI dispatched!");
            }}
          >
            Click Material UI Button to dispatch event
          </Button>
        </header>
      </div>
    </ThemeProvider>
  );
};
