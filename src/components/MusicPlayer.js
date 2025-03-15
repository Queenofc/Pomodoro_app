import React, { useState, useEffect, useRef } from "react";
import _ from "lodash"; // ✅ Import Lodash for debounce
import "./music.css";
import work from "../images/working.png";
import meditate from "../images/meditation.png";
import cook from "../images/cooking.png";
import exercise from "../images/exercise.png";
import jazz from "../images/jazz.png";
import { toast, ToastContainer } from "react-toastify";

const moodData = {
  work: { title: "Simple Harmony", url: "/audio/Idea10.mp3", color: "#40E0D0", image: work },
  meditation: { title: "Calm Waves", url: "/audio/Inyourarms.mp3", color: "#4CAF50", image: meditate },
  cooking: { title: "Kitchen Vibes", url: "/audio/Immaterial.mp3", color: "#ffcc00", image: cook },
  exercise: { title: "Energy Boost", url: "/audio/Truth.mp3", color: "#DFFF00", image: exercise },
  jazz: { title: "Smooth Jazz", url: "/audio/Nostalgia.mp3", color: "#800080", image: jazz },
};

const MusicPlayer = ({ stopMusicTrigger, onMoodChange }) => {
  const [mood, setMood] = useState("none");
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasReset, setHasReset] = useState(false); // Track if reset has been applied
  const audioRef = useRef(new Audio());
  const debounceRef = useRef(null); // ✅ Store the debounced play/pause toggle
  const shouldLoopRef = useRef(true); // Controls auto looping
  const previousMood = useRef("none"); // Track previous mood for switching detection

  // Effect for handling mood changes and playing audio
  useEffect(() => {
    if (mood === "none") {
      audioRef.current.pause();
      setIsPlaying(false);
      onMoodChange("none");
    } else {
      // Check if switching between tracks (without pausing first)
      const switchingTrack = previousMood.current !== "none" && previousMood.current !== mood;
      audioRef.current.pause();
      audioRef.current.src = moodData[mood.toLowerCase()]?.url || "";
      // Enable looping when a mood is selected
      shouldLoopRef.current = true;
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((error) => {
            // Only show toast if not stopped by timer and not switching tracks
            if (!stopMusicTrigger && !switchingTrack) {
              toast.error("Playback Error", { autoClose: 3000 });
            }
          });
      }
      onMoodChange(mood.charAt(0).toUpperCase() + mood.slice(1));
    }
    // Update previous mood for next render
    previousMood.current = mood;
  }, [mood, isPlaying, onMoodChange, stopMusicTrigger]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current
        .play()
        .catch((error) => {
          if (!stopMusicTrigger) {
            toast.error("Playback Error", { autoClose: 3000 });
          }
        });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, stopMusicTrigger]);

  // Reset the music player only once when stopMusicTrigger becomes true.
  useEffect(() => {
    if (stopMusicTrigger && !hasReset) {
      shouldLoopRef.current = false; // Disable auto-loop on song end
      audioRef.current.pause();
      audioRef.current.currentTime = 0; // Reset audio position
      setIsPlaying(false);
      setMood("none"); // Reset mood to "none"
      onMoodChange("None");
      setHasReset(true);
    } else if (!stopMusicTrigger && hasReset) {
      // When timer is running again, clear the reset flag to allow re-use.
      setHasReset(false);
    }
  }, [stopMusicTrigger, hasReset, onMoodChange]);

  // Auto-loop the audio on song end if looping is enabled and music is playing
  useEffect(() => {
    const audio = audioRef.current;
    const handleSongEnd = () => {
      audio.currentTime = 0;
      if (shouldLoopRef.current && isPlaying) {
        audio.play().catch((error) => {
          if (!stopMusicTrigger) {
            toast.error("Playback Error", { autoClose: 3000 });
          }
        });
      }
    };
    audio.addEventListener("ended", handleSongEnd);
    return () => audio.removeEventListener("ended", handleSongEnd);
  }, [mood, isPlaying, stopMusicTrigger]);

  // Debounce the play/pause toggle button so rapid clicks are ignored
  if (!debounceRef.current) {
    debounceRef.current = _.debounce(() => {
      setIsPlaying((prev) => !prev);
    }, 300); // 300ms debounce delay
  }

  return (
    <div className="musicpage">
      <ToastContainer />
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
            <button className="play-btn" onClick={debounceRef.current}>
              {isPlaying ? "⏸ Pause" : "▶ Play"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;
