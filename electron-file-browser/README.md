# Electron File Browser

A file browser application built with Electron, Radix UI, and Tailwind CSS. The application features a two-panel interface with system drives and directories displayed in the left panel and their contents shown in the right panel.

## Features

- Two-panel interface
- Left panel displays system drives/directories
- Right panel shows contents of selected directory
- Navigate through directories
- Cross-platform support (Windows, macOS, Linux)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone or download the project
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Running the Application

To start the application, run:

```bash
npm start
```

## Project Structure

- `main.js`: Main Electron process file
- `index.html`: Renderer process HTML template
- `renderer.js`: Renderer process JavaScript file
- `style.css`: Custom styles
- `tailwind.config.js`: Tailwind CSS configuration
- `postcss.config.js`: PostCSS configuration
- `package.json`: Project configuration and dependencies

## Dependencies

- Electron: Cross-platform desktop application framework
- Radix UI Icons: Accessible UI icons
- Tailwind CSS: Utility-first CSS framework

## How It Works

1. The main process (`main.js`) handles file system operations using IPC
2. The renderer process (`renderer.js`) communicates with the main process to load drives and directory contents
3. Tailwind CSS provides responsive styling
4. The UI updates dynamically as users navigate through directories

## Notes

- On Linux systems, you may need to install additional libraries for Electron to run properly:
  - `libnss3`
  - `libnspr4`
  - `libatk-bridge2.0-0`
  - `libdrm2`
  - `libxkbcommon0`
  - `libxcomposite1`
  - `libxdamage1`
  - `libxrandr2`
  - `libgbm1`
  - `libasound2`

For Ubuntu/Debian systems:
```bash
sudo apt-get install libnss3 libnspr4 libatk-bridge2.0-0 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 libasound2
```