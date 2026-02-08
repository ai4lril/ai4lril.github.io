/**
 * Detects the maximum sample rate supported by the device's microphone
 * Tests common high sample rates: 96000, 88200, 48000 (in order of preference)
 * Returns the highest supported sample rate (minimum 48000)
 */
export async function detectMaxSampleRate(): Promise<number> {
  const testRates = [96000, 88200, 48000];
  
  for (const testRate of testRates) {
    try {
      // Create AudioContext with test sample rate
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: new () => AudioContext }).webkitAudioContext;
      const testContext = new AudioContextClass({ sampleRate: testRate });
      
      // Request getUserMedia with the test sample rate
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: testRate,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      
      // Check actual sample rate from the audio track
      const audioTrack = stream.getAudioTracks()[0];
      const settings = audioTrack.getSettings();
      const actualRate = settings.sampleRate || testContext.sampleRate;
      
      // Clean up
      audioTrack.stop();
      stream.getTracks().forEach(track => track.stop());
      await testContext.close();
      
      // If actual rate matches or is close to requested rate, it's supported
      if (actualRate >= testRate * 0.95) {
        return actualRate;
      }
    } catch (error) {
      // Continue to next sample rate if this one fails
      continue;
    }
  }
  
  // Fallback to 48000 if detection fails
  return 48000;
}

/**
 * Encodes PCM audio data to WAV format
 * @param audioBuffers - Array of Float32Array buffers containing PCM audio data
 * @param sampleRate - Sample rate in Hz
 * @param numChannels - Number of channels (1 = mono, 2 = stereo)
 * @returns WAV file as Blob
 */
export function encodePCMToWAV(
  audioBuffers: Float32Array[],
  sampleRate: number,
  numChannels: number,
): Blob {
  // Concatenate all buffers to get total samples
  const totalSamples = audioBuffers.reduce((sum, buf) => sum + buf.length, 0);
  const samplesPerChannel = Math.floor(totalSamples / numChannels);
  
  // Convert float32 samples to int16 PCM
  const int16Buffer = new Int16Array(samplesPerChannel * numChannels);
  let offset = 0;
  
  for (const buffer of audioBuffers) {
    for (let i = 0; i < buffer.length; i++) {
      // Convert float32 (-1.0 to 1.0) to int16 (-32768 to 32767)
      const sample = Math.max(-1, Math.min(1, buffer[i]));
      int16Buffer[offset++] = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7FFF);
    }
  }
  
  // Calculate WAV file size
  const dataSize = numChannels * samplesPerChannel * 2; // 2 bytes per sample
  const fileSize = 44 + dataSize; // 44 bytes header + data
  
  // Create WAV file header
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  // RIFF header
  view.setUint32(0, 0x46464952, true); // "RIFF"
  view.setUint32(4, fileSize - 8, true); // File size - 8
  view.setUint32(8, 0x45564157, true); // "WAVE"
  
  // Format chunk
  view.setUint32(12, 0x20746d66, true); // "fmt "
  view.setUint32(16, 16, true); // Format chunk size (16 for PCM)
  view.setUint16(20, 1, true); // Audio format (1 = PCM)
  view.setUint16(22, numChannels, true); // Number of channels
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, sampleRate * numChannels * 2, true); // Byte rate
  view.setUint16(32, numChannels * 2, true); // Block align
  view.setUint16(34, 16, true); // Bits per sample
  
  // Data chunk
  view.setUint32(36, 0x61746164, true); // "data"
  view.setUint32(40, dataSize, true); // Data chunk size
  
  // Combine header and PCM data
  const wavBlob = new Blob([header, int16Buffer.buffer], { type: 'audio/wav' });
  
  return wavBlob;
}

/**
 * Extracts metadata from a WAV file
 */
export function extractWAVMetadata(wavBlob: Blob): Promise<{
  sampleRate: number;
  bitDepth: number;
  channels: number;
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const view = new DataView(arrayBuffer);
        
        // Read WAV header
        const numChannels = view.getUint16(22, true);
        const sampleRate = view.getUint32(24, true);
        const bitsPerSample = view.getUint16(34, true);
        const dataSize = view.getUint32(40, true);
        const duration = dataSize / (sampleRate * numChannels * (bitsPerSample / 8));
        
        resolve({
          sampleRate,
          bitDepth: bitsPerSample,
          channels: numChannels,
          duration,
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(wavBlob);
  });
}
