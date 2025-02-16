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
    url: "/audio/working.mp3",
    color: "#40E0D0",
    image: work,
  },
  meditation: {
    title: "Calm Waves",
    url: "/audio/meditation.mp3",
    color: "#4CAF50",
    image: meditate,
  },
  cooking: {
    title: "Kitchen Vibes",
    url: "/audio/cooking.mp3",
    color: "#ffcc00",
    image: cook,
  },
  exercise: {
    title: "Energy Boost",
    url: "/audio/exercise.mp3",
    color: "#DFFF00",
    image: exercise,
  },
  jazz: {
    title: "Smooth Jazz",
    url: "/audio/jazz.mp3",
    color: "#800080",
    image: jazz,
  },
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
      audioRef.current.pause(); // ✅ Stop previous track before switching
      audioRef.current.src = moodData[mood.toLowerCase()]?.url || ""; 
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error("Playback error:", error));
      }
      onMoodChange(mood.charAt(0).toUpperCase() + mood.slice(1));
    }
  }, [mood, isPlaying,onMoodChange]); 

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
  }, [stopMusicTrigger,onMoodChange]); 

  useEffect(() => {
    const audio = audioRef.current;

    const handleSongEnd = () => {
      audio.currentTime = 0;
      audio.play();
    };

    audio.addEventListener("ended", handleSongEnd);

    return () => {
      audio.removeEventListener("ended", handleSongEnd); // ✅ Proper cleanup
    };
  }, [mood]); // ✅ Ensure this updates when mood changes

  return (
    <div className="music-container">
      <h2>Music Player</h2>
      <select onChange={(e) => setMood(e.target.value.toLowerCase())} value={mood}>
        <option value="none">None</option>
        {Object.keys(moodData).map((key) => (
          <option key={key} value={key.toLowerCase()}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </option>
        ))}
      </select>

      {mood !== "none" && (
        <div className="music-box">
          <img
            src={moodData[mood.toLowerCase()]?.image}
            alt={moodData[mood.toLowerCase()]?.title}
            className="music-image"
          />
          <h3>{moodData[mood.toLowerCase()]?.title}</h3>
          <button className="play-btn" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
