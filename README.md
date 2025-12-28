# Shape Dash

A high-speed, geometry-based endless runner built with Phaser 3. Dash through obstacles, switch forms, and aim for the high score!

![Gameplay Demo](assets/gameplay_placeholder.gif)

## 🎮 Game Overview

Control a shapeshifting cube (or sphere... or triangle!) and navigate through a procedurally generated world filled with spikes, pits, and cliffs.

*   **Survive**: Jump over spikes and gaps. The speed is constant, but the challenge never stops.
*   **Characters**: Choose from 3 unique shapes, each with its own physics and style:
    *   **Square**: A classic, solid slide.
    *   **Circle**: A rolling ball with Pac-Man inspired visuals.
    *   **Triangle**: A fast-spinning, pointy daredevil.
*   **Physics**: Experience satisfying arcade physics with forceful jumps, gravity, and explosive deaths.

## 🕹️ Controls

| Action | Key(s) |
| :--- | :--- |
| **Jump** | `Space`, `Up Arrow`, or `Left Click` |
| **Restart (Game Over)** | `Space` |
| **Main Menu** | Click the button or Refresh |

## ✨ Features

*   **Infinite Procedural Levels**: No two runs are the same. The world generates endlessly with varied segments (flats, gaps, cliffs).
*   **Dynamic Visuals**:
    *   **Particle Explosions**: Watch your character shatter into pieces with "fireworks" physics and matched colors upon death.
    *   **Camera Shake**: Feel the impact of every crash.
*   **Persistent High Score**: Your best distance is saved locally so you can always try to beat your record.
*   **Polished UX**: Smooth scene transitions, clear UI, and instant restarts.

## 🌐 Play Online

**[Play the Game Here!](https://rezky-ashari.github.io/shape-dash/)**

## 🛠️ Tech Stack

*   **Engine**: [Phaser 3](https://phaser.io/) (Arcade Physics)
*   **Language**: Vanilla JavaScript (ES6+)
*   **Tooling**: [Vite](https://vitejs.dev/) for fast development and building.

## 🚀 How to Run

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser at the local URL (usually `http://localhost:5173`).

## License

MIT

## 🚀 Deployment (GitHub Pages)

This project is configured for easy deployment to GitHub Pages.

1.  **Initialize Git** (if not done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  **Create a Repository** on GitHub.
3.  **Link Remote**:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/shape-dash.git
    ```
4.  **Deploy**:
    ```bash
    npm run deploy
    ```
    This command will automatically build the project and push the `dist` folder to a `gh-pages` branch on your repository.
4.  **Enable Pages**: Go to your GitHub Repo Settings -> Pages -> Source, and ensure it is serving from the `gh-pages` branch.
