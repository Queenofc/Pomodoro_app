import React, { useState } from "react";

const PomodoroTimer = () => {
  const [time, setTime] = useState(25 * 60); // Default 25 min
  const [customTime, setCustomTime] = useState("");

  return (
    <div>
      <h2>Timer: {Math.floor(time / 60)}:{("0" + (time % 60)).slice(-2)}</h2>
      <select onChange={(e) => setTime(e.target.value * 60)}>
        <option value="25">25 Minutes</option>
        <option value="custom">Custom</option>
      </select>
      {time === "custom" && (
        <input
          type="number"
          min="1"
          max="1440"
          value={customTime}
          onChange={(e) => setCustomTime(e.target.value)}
        />
      )}
    </div>
  );
};

export default PomodoroTimer;
