import React, { useState } from "react";
import PomodoroTimer from "./components/PomodoroTimer";
import MusicPlayer from "./components/MusicPlayer";

const App = () => {
  const [stopMusicTrigger, setStopMusicTrigger] = useState(false);

  return (
    <div>
      <PomodoroTimer setStopMusicTrigger={setStopMusicTrigger} />
      <MusicPlayer stopMusicTrigger={stopMusicTrigger} />
    </div>
  );
};

export default App;
