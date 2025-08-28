# ScriptRunner

ScriptRunner is a minimal, cross-platform desktop application built with [Electron](https://www.electronjs.org/) and JavaScript. It provides a simple yet powerful interface for running, managing, and testing scripts directly from your desktop environment. ScriptRunner is ideal for developers, automation enthusiasts, and anyone who needs a convenient way to execute scripts without relying on a terminal or command-line interface.

## Features

- **Run Scripts Easily**: Execute JavaScript, Node.js, shell (`.sh`), or Python scripts with just a click.
- **Script Grouping**: Organize scripts into groups and execute an entire group either sequentially. This allows for complex automation workflows across multiple scripting languages.
- **Cross-Platform**: Available for Windows, macOS, and Linux.
- **Minimal UI**: Clean, distraction-free interface focused on script execution.
- **Project Management**: Organize and manage your scripts and groups within the application.
- **Live Output**: View script output and errors in real-time.
- **Open Source**: Freely available for modification and enhancement.

## Screenshots

*(Add screenshots of the application here when available)*

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 16 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/laariane/ScriptRunner.git
cd ScriptRunner
npm install
```

### Development

To start the application in development mode with hot-reload:

```bash
npm run dev
```

### Building for Production

You can build the application for your operating system:

```bash
# For Windows
npm run build:win

# For macOS
npm run build:mac

# For Linux
npm run build:linux
```

The built application will be available in the `dist` directory.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) with:
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Contributing

Contributions are welcome! Please submit bug reports, feature requests, or pull requests via GitHub.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgements

- [Electron](https://www.electronjs.org/)
- The open source community

---

*For questions or support, please open an issue on the GitHub repository.*
