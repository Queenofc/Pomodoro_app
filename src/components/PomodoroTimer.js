import React, { useState, useEffect, useRef } from "react";
import "./music.css";
import sunIcon from "../images/sun.png"; // Light mode icon
import moonIcon from "../images/moon.png"; // Dark mode icon
import power from "../images/power.png"; 
import logo from "../images/logo.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { toast, ToastContainer } from "react-toastify";

const PomodoroTimer = ({ setStopMusicTrigger }) => {
  const [time, setTime] = useState(() => {
    return parseInt(localStorage.getItem("remainingTime"), 10) || 0;
  });
  const [isActive, setIsActive] = useState(() => {
    return localStorage.getItem("isTimerActive") === "true";
  });
  const [customTime, setCustomTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });
  const { logout } = useAuth(); // ✅ Get user from context
  const navigate = useNavigate();

  const alarmSound = useRef(
    new Audio("https://www.fesliyanstudios.com/play-mp3/4387")
  );

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  useEffect(() => {
    let timer;
    if (isActive && time > 0) {
      timer = setInterval(() => {
        setTime((prev) => {
          const newTime = prev - 1;
          localStorage.setItem("remainingTime", newTime);
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
    localStorage.setItem("isTimerActive", isActive);
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
    localStorage.setItem("remainingTime", 0);
    setStopMusicTrigger(true);
    alarmSound.current.pause();
    alarmSound.current.currentTime = 0;
    alarmSound.current.loop = false;
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(0);
    localStorage.setItem("remainingTime", 0);
    setStopMusicTrigger(true);
    alarmSound.current.pause();
    alarmSound.current.currentTime = 0;
    alarmSound.current.loop = false;
  };

  const handlePresetChange = (event) => {
    const presetTimes = { 60: 60, 300: 5 * 60, 1500: 25 * 60, 2700: 45 * 60 };
    const newTime = presetTimes[event.target.value] || 0;
    setTime(newTime);
    localStorage.setItem("remainingTime", newTime);
  };

  const handleCustomTimeChange = (event) => {
    const { name, value } = event.target;
    let numericValue = parseInt(value, 10);
  
    if (value === "") {
      setCustomTime((prev) => ({ ...prev, [name]: "" }));
      return;
    }
  
    if (isNaN(numericValue)) numericValue = 0;
  
    const limits = {
      hours: [0, 23],
      minutes: [0, 59],
      seconds: [0, 59],
    };
  
    if (numericValue < limits[name][0] || numericValue > limits[name][1]) {
      if (!toast.isActive("timeError")) {
        toast.dismiss("timeError"); // Ensure old toast is removed before showing a new one
        toast.error("Enter a valid time period!", {
          autoClose: 3000,
          toastId: "timeError",
        });
      }
      return;
    }
  
    setCustomTime((prev) => ({ ...prev, [name]: numericValue }));
  };
  
  

  const applyCustomTime = () => {
    if (isActive) {
      toast.error("Pause the timer before setting a new time!", { autoClose: 3000 });
      return;
    }
  
    const totalSeconds =
      customTime.hours * 3600 + customTime.minutes * 60 + customTime.seconds;
    if (totalSeconds > 0) {
      setTime(totalSeconds);
      localStorage.setItem("remainingTime", totalSeconds);
    }
  };
  
  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", newMode);
      return newMode;
    });
  };
  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      logout(); // Clears token and sets isAuthenticated to false
      navigate("/login");
    } catch (error) {
      toast.dismiss("logoutError");
      toast.error("Logout failed", { autoClose: 3000 });
    }
  };

  return (
    <div className="mainpage">
    <ToastContainer />
    <div className={`container ${isDarkMode ? "dark" : "light"}`}>
      <div className="topbar">
        <button className="logoutbutton"onClick={handleLogout}>
          <img src={power} alt="" width="25" height="25" />
          Logout
        </button>
        <button className="theme-toggle" onClick={toggleTheme}>
          <img src={isDarkMode ? sunIcon : moonIcon} alt="Theme Icon" />
        </button>
      </div>
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
        <option value="" disabled>
          Select Timer
        </option>
        <option value="60">1 min</option>
        <option value="300">5 min</option>
        <option value="1500">25 min</option>
        <option value="2700">45 min</option>
      </select>

      <div className="custom-time">
        <label>Hours:</label>
        <input
          type="number"
          name="hours"
          min="0"
          max="23"
          value={customTime.hours || ""}
          onChange={handleCustomTimeChange}
        />
        <label>Minutes:</label>
        <input
          type="number"
          name="minutes"
          min="0"
          max="59"
          value={customTime.minutes || ""}
          onChange={handleCustomTimeChange}
        />
        <label>Seconds:</label>
        <input
          type="number"
          name="seconds"
          min="0"
          max="59"
          value={customTime.seconds || ""}
          onChange={handleCustomTimeChange}
        />
        <button onClick={applyCustomTime} disabled={isActive}>Set</button>
      </div>

      <div className="controls">
        <button onClick={startTimer}>Start</button>
        <button onClick={pauseTimer}>Pause</button>
        <button onClick={stopTimer}>Mute Alarm</button>
        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
    </div>
  );
};

export default PomodoroTimer;
