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

const row = {
  display: "flex",
  width: "800px",
  height: "50px",
  justifyContent: "space-around",
  alignItems: "center",
};
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
      console.log("UI received chat event message:", message);
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
          <div style={row}>
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
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => {
                window.SessionInvoker.vscode.commands.executeCommand(
                  "workbench.action.webview.openDeveloperTools"
                );
              }}
            >
              open devtools
            </Button>
          </div>
          <p>
            The following is a state saved by extension (Here we used a Date
            string for example).
          </p>
          <div>{loading ? <CircularProgress /> : dateStore.date || "null"}</div>
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
            Here are also some convenient APIs for communication between UI and
            extension.
          </p>
          <div style={row}>
            <Button
              color="secondary"
              variant="contained"
              onClick={() => {
                window.SessionInvoker.vscode.window.showInformationMessage(
                  "Hello, called vscode.window.showInformationMessage API!",
                  {}
                );
              }}
            >
              Click to toast message
            </Button>

            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                window.SessionHubs.emit("chat", "Dispatched by UI");
              }}
            >
              Click to dispatch event
            </Button>
          </div>
          <p>
            If you do not need these complicated code, you can switch to branch{" "}
            <a
              href="https://github.com/DarrenDanielDay/vscode-react-ui-demo/tree/minimum-example"
              className={styles["App-link"]}
            >
              minimum-example
            </a>{" "}
            to see a simpler example.
          </p>
        </header>
      </div>
    </ThemeProvider>
  );
};
