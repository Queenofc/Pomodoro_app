import React, { useState, useEffect, useRef } from "react";
import "./music.css";
import work from "../images/working.png";
import meditate from "../images/meditation.png";
import cook from "../images/cooking.png";
import exercise from "../images/exercise.png";
import jazz from "../images/jazz.png";

const moodData = {
  work: {
    title: "Simple Harmony",
    url: "/audio/Idea10.mp3",
    color: "#40E0D0",
    image: work,
  },
  meditation: {
    title: "Calm Waves",
    url: "/audio/Nostalgia.mp3",
    color: "#4CAF50",
    image: meditate,
  },
  cooking: {
    title: "Kitchen Vibes",
    url: "/audio/Immaterial.mp3",
    color: "#ffcc00",
    image: cook,
  },
  exercise: {
    title: "Energy Boost",
    url: "/audio/Truth.mp3",
    color: "#DFFF00",
    image: exercise,
  },
  jazz: {
    title: "Smooth Jazz",
    url: "/audio/Nostalgia.mp3",
    color: "#800080",
    image: jazz,
  },
};

const MusicPlayer = ({ stopMusicTrigger, onMoodChange, resetTrigger }) => {
  const [mood, setMood] = useState("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (mood === "none") {
      audioRef.current.pause();
      setIsPlaying(false);
      onMoodChange("None");
    } else {
      audioRef.current.src = moodData[mood]?.url || "";
      audioRef.current.load();
    }
  }, [mood, onMoodChange]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current
        .play()
        .catch((error) => console.error("Playback error:", error));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (stopMusicTrigger) {
      audioRef.current.pause();
      setIsPlaying(false);
      onMoodChange("None");
    }
  }, [stopMusicTrigger, onMoodChange]);

  useEffect(() => {
    if (resetTrigger) {
      audioRef.current.pause();
      setMood("none");
      setIsPlaying(false);
      onMoodChange("None");
    }
  }, [resetTrigger, onMoodChange]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleSongEnd = () => {
      audio.currentTime = 0;
      audio.play().catch((error) => console.error("Playback error:", error));
    };

    audio.addEventListener("ended", handleSongEnd);
    return () => {
      audio.removeEventListener("ended", handleSongEnd);
    };
  }, [mood]);

  return (
    <div className="music-container">
      <h2>Music Player</h2>
      <select onChange={(e) => setMood(e.target.value)} value={mood}>
        <option value="none">None</option>
        {Object.keys(moodData).map((key) => (
          <option key={key} value={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</option>
        ))}
      </select>

      {mood !== "none" && (
        <div className="music-box">
          <img
            src={moodData[mood]?.image}
            alt={moodData[mood]?.title}
            className="music-image"
          />
          <h3>{moodData[mood]?.title}</h3>
          <button className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
