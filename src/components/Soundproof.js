import React, { useState, useEffect, useRef } from 'react';
import { Howl } from 'howler';

const SoundproofDemo = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuffled, setIsMuffled] = useState(true);
  const [audioContext, setAudioContext] = useState(null);
  const [muffler, setMuffler] = useState(null);
  const [sourceNode, setSourceNode] = useState(null);
  const [progress, setProgress] = useState(0);
  const soundRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Create AudioContext and BiquadFilter for muffling effect
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 100; // Adjust frequency to muffle sound

    setAudioContext(audioCtx);
    setMuffler(filter);
    console.log('AudioContext and BiquadFilter created');
  }, []);

  const playSound = async () => {
    if (soundRef.current) {
      soundRef.current.stop();
    }

    // Resume the audio context after user interaction
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
      console.log('AudioContext resumed');
    }

    const sound = new Howl({
      src: ['/barking.mp3'], // Ensure correct path
      html5: true,
      onload: () => {
        console.log('Sound loaded successfully');
      },
      onplay: () => {
        console.log('Sound is playing');
        const audioElement = sound._sounds[0]._node;
        console.log('Audio element:', audioElement);
        const source = audioContext.createMediaElementSource(audioElement);
        setSourceNode(source);
        if (isMuffled) {
          source.connect(muffler);
          muffler.connect(audioContext.destination);
          console.log('Muffling effect applied');
        } else {
          source.connect(audioContext.destination);
          console.log('No muffling effect applied');
        }
        setIsPlaying(true);

        // Start interval to update progress
        intervalRef.current = setInterval(() => {
          setProgress(audioElement.currentTime / audioElement.duration);
        }, 100);
      },
      onend: () => {
        console.log('Sound has ended');
        setIsPlaying(false);
        clearInterval(intervalRef.current);
        setProgress(0);
      },
      onloaderror: (id, err) => {
        // console.error('Sound loading error:', err);
      },
      onplayerror: (id, err) => {
        // console.error('Sound playing error:', err);
      }
    });

    soundRef.current = sound;
    sound.play();
  };

  const toggleMuffle = () => {
    if (sourceNode) {
      sourceNode.disconnect();
      muffler.disconnect();
      if (isMuffled) {
        sourceNode.connect(audioContext.destination);
        console.log('Muffling effect turned off');
      } else {
        sourceNode.connect(muffler);
        muffler.connect(audioContext.destination);
        console.log('Muffling effect turned on');
      }
      setIsMuffled(!isMuffled);
    }
  };

  return (
    <div>
      <h1>Soundproofing Demo</h1>
      <button onClick={playSound} disabled={isPlaying}>
        {isPlaying ? 'Playing...' : 'Play Dog Barking'}
      </button>
      <button onClick={toggleMuffle} disabled={!isPlaying}>
        {isMuffled ? 'Turn Off Muffle' : 'Turn On Muffle'}
      </button>
      {isPlaying && (
        <div>
          <div>Playing...</div>
          <div>Progress: {(progress * 100).toFixed(2)}%</div>
        </div>
      )}
    </div>
  );
};

export default SoundproofDemo;
