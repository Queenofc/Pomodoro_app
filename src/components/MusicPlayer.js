import React, { useState, useEffect, useRef } from "react";
import './music.css';

const MusicPlayer = ({ stopMusicTrigger }) => {
  const [mood, setMood] = useState("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(new Audio());

  const moodData = {
    work: { title: "Focus Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    meditation: { title: "Calm Waves", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    cooking: { title: "Kitchen Vibes", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    exercise: { title: "Energy Boost", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
    jazz: { title: "Smooth Jazz", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  };

  useEffect(() => {
    if (mood === "none") {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.src = moodData[mood].url;
      if (isPlaying) audioRef.current.play();
    }
  }, [mood]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (stopMusicTrigger) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [stopMusicTrigger]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="music-container">
      <h2>Music Player</h2>
      <select onChange={(e) => setMood(e.target.value)} value={mood}>
        <option value="none">None</option>
        <option value="work">Work</option>
        <option value="meditation">Meditation</option>
        <option value="cooking">Cooking</option>
        <option value="exercise">Exercise</option>
        <option value="jazz">Jazz</option>
      </select>

      {mood !== "none" && (
        <div className="music-box">
          <h3>{moodData[mood].title}</h3>
          <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
        </div>
      )}

      <audio ref={audioRef} />
    </div>
  );
};

export default MusicPlayer;
