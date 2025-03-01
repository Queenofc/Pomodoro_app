import React, { useState, useEffect } from "react";
import PomodoroTimer from "./PomodoroTimer";
import MusicPlayer from "./MusicPlayer";
import "./music.css";

const moodColors = {
  Work: "#ff5733",
  Meditation: "#4CAF50",
  Cooking: "#ffcc00",
  Exercise: "#007bff",
  Jazz: "#8e44ad",
};

const Home = () => {
  const [stopMusicTrigger, setStopMusicTrigger] = useState(false);
  const [trailColor, setTrailColor] = useState("#ff4500");

  const handleMoodChange = (selectedMood) => {
    setTrailColor(moodColors[selectedMood] || "#ff4500");
  };

  useEffect(() => {
    const createTrail = (event) => {
      if (document.querySelectorAll(".trail").length > 50) {
        document.querySelector(".trail").remove();
      }

      const trail = document.createElement("div");
      trail.className = "trail";
      trail.style.position = "fixed";
      trail.style.backgroundColor = trailColor;
      trail.style.boxShadow = `0 0 10px ${trailColor}`;
      trail.style.width = "10px";
      trail.style.height = "10px";
      trail.style.borderRadius = "50%";
      trail.style.pointerEvents = "none";
      trail.style.left = `${event.clientX}px`;
      trail.style.top = `${event.clientY}px`;

      document.body.appendChild(trail);

      setTimeout(() => {
        trail.remove();
      }, 700);
    };

    document.addEventListener("mousemove", createTrail);
    return () => {
      document.removeEventListener("mousemove", createTrail);
    };
  }, [trailColor]);
  
  return (
    <div>
      <PomodoroTimer setStopMusicTrigger={setStopMusicTrigger} />
      <MusicPlayer stopMusicTrigger={stopMusicTrigger} onMoodChange={handleMoodChange} />
    </div>
  );
};

export default Home;
