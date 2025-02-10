import React, { useState } from "react";

const MusicPlayer = () => {
  const [mood, setMood] = useState("work");

  return (
    <div>
      <h2>Music Player</h2>
      <select onChange={(e) => setMood(e.target.value)}>
        <option value="work">Work</option>
        <option value="meditation">Meditation</option>
        <option value="cooking">Cooking</option>
        <option value="exercise">Exercise</option>
        <option value="jazz">Jazz</option>
      </select>
    </div>
  );
};

export default MusicPlayer;
