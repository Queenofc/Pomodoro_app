import React, { useState, useEffect, useRef } from "react";
import "./music.css";
import sunIcon from "../images/sun.png";
import moonIcon from "../images/moon.png";
import logo from "../images/logo.png";

const PomodoroTimer = ({ setStopMusicTrigger }) => {
  const [time, setTime] = useState(() => {
    return parseInt(sessionStorage.getItem("remainingTime"), 10) || 0;
  });
  const [isActive, setIsActive] = useState(() => {
    return sessionStorage.getItem("isTimerActive") === "true";
  });
  const [customTime, setCustomTime] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return sessionStorage.getItem("darkMode") === "true";
  });

  const alarmSound = useRef(new Audio("https://www.fesliyanstudios.com/play-mp3/4387"));

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
    sessionStorage.setItem("darkMode", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    let timer;
    if (isActive && time > 0) {
      timer = setInterval(() => {
        setTime((prev) => {
          const newTime = prev - 1;
          sessionStorage.setItem("remainingTime", newTime);
          return newTime;
        });
      }, 1000);
    } else if (time === 0 && isActive) {
      clearInterval(timer);
      setIsActive(false);
      setStopMusicTrigger(true);
      alarmSound.current.loop = true;
      alarmSound.current.play();
    }
    return () => clearInterval(timer);
  }, [isActive, time, setStopMusicTrigger]);

  useEffect(() => {
    sessionStorage.setItem("isTimerActive", isActive);
  }, [isActive]);

  const startTimer = () => {
    if (time > 0) {
      setIsActive(true);
      setStopMusicTrigger(false);
    }
  };

  const pauseTimer = () => setIsActive(false);

  const stopTimer = () => {
    setIsActive(false);
    setTime(0);
    sessionStorage.setItem("remainingTime", 0);
    setStopMusicTrigger(true);
    alarmSound.current.pause();
    alarmSound.current.currentTime = 0;
    alarmSound.current.loop = false;
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(0);
    sessionStorage.setItem("remainingTime", 0);
    setStopMusicTrigger(true);
    alarmSound.current.pause();
    alarmSound.current.currentTime = 0;
    alarmSound.current.loop = false;
  };

  const handlePresetChange = (event) => {
    const presetTimes = { 60: 60, 300: 5 * 60, 1500: 25 * 60, 2700: 45 * 60 };
    const newTime = presetTimes[event.target.value] || 0;
    setTime(newTime);
    sessionStorage.setItem("remainingTime", newTime);
  };

  const handleCustomTimeChange = (event) => {
    const { name, value } = event.target;
    let numericValue = parseInt(value, 10) || 0;
    if ((name === "hours" && (numericValue < 0 || numericValue > 23)) ||
        (name === "minutes" && (numericValue < 0 || numericValue > 59)) ||
        (name === "seconds" && (numericValue < 0 || numericValue > 59))) {
      alert("Enter a valid time period!");
      numericValue = 0;
    }
    setCustomTime((prev) => ({ ...prev, [name]: numericValue }));
  };

  const applyCustomTime = () => {
    const totalSeconds = customTime.hours * 3600 + customTime.minutes * 60 + customTime.seconds;
    if (totalSeconds > 0) {
      setTime(totalSeconds);
      sessionStorage.setItem("remainingTime", totalSeconds);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={`container ${isDarkMode ? "dark" : "light"}`}>
      <button className="theme-toggle" onClick={toggleTheme}>
        <img src={isDarkMode ? sunIcon : moonIcon} alt="Theme Icon" />
      </button>
      <div className="title">
        <img src={logo} alt="" />
        <h1>Chill With Pomodoro</h1>
      </div>
      <h2>
        {Math.floor(time / 3600)}:
        {String(Math.floor((time % 3600) / 60)).padStart(2, "0")}:
        {String(time % 60).padStart(2, "0")}
      </h2>

      <select onChange={handlePresetChange} defaultValue="">
        <option value="" disabled>Select Timer</option>
        <option value="60">1 min</option>
        <option value="300">5 min</option>
        <option value="1500">25 min</option>
        <option value="2700">45 min</option>
      </select>

      <div className="custom-time">
        <label>Hours:</label>
        <input type="number" name="hours" min="0" max="23" value={customTime.hours || ""} onChange={handleCustomTimeChange} />
        <label>Minutes:</label>
        <input type="number" name="minutes" min="0" max="59" value={customTime.minutes || ""} onChange={handleCustomTimeChange} />
        <label>Seconds:</label>
        <input type="number" name="seconds" min="0" max="59" value={customTime.seconds || ""} onChange={handleCustomTimeChange} />
        <button onClick={applyCustomTime}>Set</button>
      </div>

      <div className="controls">
        <button onClick={startTimer}>Start</button>
        <button onClick={pauseTimer}>Pause</button>
        <button onClick={stopTimer}>Stop Timer</button>
        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
