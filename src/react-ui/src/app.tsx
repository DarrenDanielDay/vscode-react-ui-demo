import React, { useState } from "react";
import {
  Button,
  colors,
  createMuiTheme,
  ThemeProvider,
} from "@material-ui/core";
import logo from "./logo.svg";
import github from "./github.jpg";
import styles from "./index.module.css";

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
          </div>
        </header>
      </div>
    </ThemeProvider>
  );
};
