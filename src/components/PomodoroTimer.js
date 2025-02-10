import React, { useState, useEffect, useRef } from "react";

const PomodoroTimer = () => {
  const [time, setTime] = useState(25 * 60); // Default: 25 minutes
  const [isCustom, setIsCustom] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [selectedOption, setSelectedOption] = useState("25"); // Default: 25 min
  const [isCompleted, setIsCompleted] = useState(false);

  const [customHours, setCustomHours] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");

  const alarmSound = useRef(new Audio("https://www.fesliyanstudios.com/play-mp3/4387"));


  useEffect(() => {
    let timer;
    if (isActive && time > 0) {
      timer = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    } else if (time === 0 && isActive) {
      clearInterval(timer);
      setIsActive(false);
      setIsCompleted(true);
      alarmSound.current.play(); // Play alarm sound when timer reaches 0
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isActive, time]);

  // Convert time format to HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${("0" + mins).slice(-2)}:${("0" + secs).slice(-2)}`;
  };

  // Handle dropdown selection
  const handleTimeChange = (e) => {
    const value = e.target.value;
    setSelectedOption(value);

    if (value === "custom") {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      setTime(parseInt(value) * 60); // Convert minutes to seconds
      setIsCompleted(false); // Reset completed state
    }
  };

  // Handle custom time input
  const handleCustomTimeSubmit = () => {
    const h = parseInt(customHours) || 0;
    const m = parseInt(customMinutes) || 0;
    const s = parseInt(customSeconds) || 0;

    const totalSeconds = h * 3600 + m * 60 + s;

    if (totalSeconds > 0 && totalSeconds <= 24 * 3600) {
      setTime(totalSeconds);
      setIsCustom(false);
      setCustomHours("");
      setCustomMinutes("");
      setCustomSeconds("");
      setIsCompleted(false); // Reset completed state
    } else {
      alert("Please enter a valid time between 1 second and 24 hours.");
    }
  };

  // Timer controls
  const startTimer = () => {
    setIsActive(true);
    setIsCompleted(false);
  };

  const pauseTimer = () => setIsActive(false);

  const resetTimer = () => {
    setIsActive(false);
    setTime(25 * 60); // Reset to 25 minutes
    setIsCustom(false);
    setSelectedOption("25");
    setIsCompleted(false); // Reset completed state
    alarmSound.current.pause();
    alarmSound.current.currentTime = 0; // Stop sound
  };

  const stopAlarm = () => {
    alarmSound.current.pause();
    alarmSound.current.currentTime = 0; // Stop sound
  };

  return (
    <div className="container">
      <h2>Timer: {formatTime(time)}</h2>

      {/* Dropdown to select predefined times */}
      <select value={selectedOption} onChange={handleTimeChange}>
        <option value="1">1 Min</option>
        <option value="5">5 Min</option>
        <option value="10">10 Min</option>
        <option value="25">25 Min (Standard)</option>
        <option value="45">45 Min</option>
        <option value="custom">Custom Time</option>
      </select>

      {/* Custom time input fields (hours, minutes, seconds) */}
      {isCustom && (
        <div>
          <input
            type="number"
            min="0"
            max="24"
            value={customHours}
            onChange={(e) => setCustomHours(e.target.value)}
            placeholder="Hours"
          />
          <input
            type="number"
            min="0"
            max="59"
            value={customMinutes}
            onChange={(e) => setCustomMinutes(e.target.value)}
            placeholder="Minutes"
          />
          <input
            type="number"
            min="0"
            max="59"
            value={customSeconds}
            onChange={(e) => setCustomSeconds(e.target.value)}
            placeholder="Seconds"
          />
          <button onClick={handleCustomTimeSubmit}>Set Time</button>
        </div>
      )}

      {/* Timer Controls */}
      {!isCompleted ? (
        <div className="controls">
          <button className="start-btn" onClick={startTimer}>Start</button>
          <button className="pause-btn" onClick={pauseTimer}>Pause</button>
          <button className="reset-btn" onClick={resetTimer}>Reset</button>
        </div>
      ) : (
        <div>
          <button className="rest-btn" onClick={resetTimer}>Reset</button>
          <button className="stop-alarm-btn" onClick={stopAlarm}>Stop Alarm</button>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;
