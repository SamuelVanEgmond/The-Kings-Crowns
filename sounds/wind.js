// Sound requireS user interaction!
// Started by the menu.play()
function startWind() {
  let windaudioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Create an empty three-second stereo buffer at the sample rate of the AudioContext
  const myArrayBuffer = windaudioContext.createBuffer(
    2,
    windaudioContext.sampleRate * 10,
    windaudioContext.sampleRate,
  );

  // Fill the buffer with some pink(?) noise;
  // Just random values between -1.0 and 1.0 
  for (let channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
    // This gives us the actual array that contains the data
    const nowBuffering = myArrayBuffer.getChannelData(channel);
    let v = 0;
    for (let i = 0; i < myArrayBuffer.length; i++) {
      // Use sine for the wave volume
      let s = Math.sin(i/myArrayBuffer.length*Math.PI*2) * 0.04 + 0.08;
      
      // Math.random() is in [0; 1.0]
      // audio needs to be in [-1.0; 1.0]
      // We do a 'moving average' to filter out the high frequencies to get a better wind-like sound
      nowBuffering[i] = (v*100 + (Math.random() * 2 - 1) * s)/101;
      v = nowBuffering[i];
    }
  }

  // Get an AudioBufferSourceNode.
  // This is the AudioNode to use when we want to play an AudioBuffer
  let wind = windaudioContext.createBufferSource();

  // set the buffer in the AudioBufferSourceNode
  wind.buffer = myArrayBuffer;
  wind.loop = true;

  // connect the AudioBufferSourceNode to the
  // destination so we can hear the sound
  wind.connect(windaudioContext.destination);

  // start the wind sound
  wind.start();
}