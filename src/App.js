import React from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import MusicPlayer from "./components/MusicPlayer";

function App() {
  return (
    <div className="container">
      <h1>Pomodoro Timer</h1>
      <PomodoroTimer />
      <MusicPlayer />
    </div>
  );
}

export default App;
