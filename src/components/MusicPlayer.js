import React, { useState, useEffect, useRef } from "react";
import "./music.css";

const moodData = {
  work: { title: "Focus Beats", url: "/audio/working.mp3", color: "#40E0D0" },
  meditation: { title: "Calm Waves", url: "/audio/meditation.mp3", color: "#4CAF50" },
  cooking: { title: "Kitchen Vibes", url: "/audio/cooking.mp3", color: "#ffcc00" },
  exercise: { title: "Energy Boost", url: "/audio/exercise.mp3", color: "#DFFF00" },
  jazz: { title: "Smooth Jazz", url: "/audio/jazz.mp3", color: "#00FF00" },
};

const MusicPlayer = ({ stopMusicTrigger, onMoodChange }) => {
  const [mood, setMood] = useState("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  useEffect(() => {
    if (mood === "none") {
      audioRef.current.pause();
      setIsPlaying(false);
      onMoodChange("None"); 
    } else {
      audioRef.current.src = moodData[mood].url;
      if (isPlaying) {
        audioRef.current.play().catch((error) => console.error("Playback error:", error));
      }
      onMoodChange(mood.charAt(0).toUpperCase() + mood.slice(1));
    }
  }, [mood, isPlaying, onMoodChange]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch((error) => console.error("Playback error:", error));
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
  }, [onMoodChange, stopMusicTrigger]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleSongEnd = () => {
      audio.currentTime = 0;
      audio.play();
    };

    audio.addEventListener("ended", handleSongEnd);

    return () => {
      audio.removeEventListener("ended", handleSongEnd);
    };
  }, []);

  return (
    <div className="music-container">
      <h2>Music Player</h2>
      <select onChange={(e) => setMood(e.target.value)} value={mood}>
        <option value="none">None</option>
        {Object.keys(moodData).map((key) => (
          <option key={key} value={key}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </option>
        ))}
      </select>

      {mood !== "none" && (
        <div className="music-box">
          <h3>{moodData[mood].title}</h3>
          <button className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
