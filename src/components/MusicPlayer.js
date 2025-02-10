import React, { useState, useEffect, useRef } from "react";
import "./music.css";

const moodData = {
  work: { title: "Focus Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", color: "#40E0D0" },
  meditation: { title: "Calm Waves", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", color: "#4CAF50" },
  cooking: { title: "Kitchen Vibes", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", color: "#ffcc00" },
  exercise: { title: "Energy Boost", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", color: "#DFFF00" },
  jazz: { title: "Smooth Jazz", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", color: "#00FF00" },
};

const MusicPlayer = ({ stopMusicTrigger, onMoodChange }) => {
  const [mood, setMood] = useState("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  // 🎵 Handle Mood Change
  useEffect(() => {
    if (mood === "none") {
      audioRef.current.pause();
      setIsPlaying(false);
      onMoodChange("None"); // Reset trail color
    } else {
      audioRef.current.src = moodData[mood].url;
      if (isPlaying) {
        audioRef.current.play().catch((error) => console.error("Playback error:", error));
      }
      onMoodChange(mood.charAt(0).toUpperCase() + mood.slice(1)); // Notify parent
    }
  }, [mood,isPlaying,onMoodChange]);

  // ▶️ Handle Play/Pause Toggle
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch((error) => console.error("Playback error:", error));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // ⏹ Handle Stop Music Trigger
  useEffect(() => {
    if (stopMusicTrigger) {
      audioRef.current.pause();
      setIsPlaying(false);
      onMoodChange("None");
    }
  }, [onMoodChange,stopMusicTrigger]);

    // 🔄 Loop Song When It Ends
    useEffect(() => {
      const audio = audioRef.current;
  
      const handleSongEnd = () => {
        audio.currentTime = 0; // Reset song to beginning
        audio.play(); // Restart playback
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
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      )}
    </div>
  );
};

export default MusicPlayer;
