# vscode-react-ui-demo

A simple demo for developing vscode extension UI with webview powered by React.

## Requirements

- Nodejs >= 10.19
- Yarn >= 1.20
- Visual Studio Code >= 1.50

## Quick Start

Suppose you have added command `code` to your `PATH` environment variables.

If you have not added it, you can follow this guide: <https://code.visualstudio.com/docs/editor/command-line#_common-questions>

First, clone this project and open this folder with `vscode`:

```sh
git clone https://github.com/DarrenDanielDay/vscode-react-ui-demo.git
code vscode-react-ui-demo           # This command opens a `vscode` window.
```

In the opened `vscode` window, open the integrated terminal and run the following to build and develop the react UI:

```sh
# In the integrated terminal of vscode window
yarn            # Install dependencies for extension.
cd src/react-ui
yarn            # Install dependencies for UI sub-project.
yarn watch      # Compile and watch file changes.
```

Then press `F5` in `vscode`, and you will see the demo UI in a new `vscode` window.

**Enjoy!**
