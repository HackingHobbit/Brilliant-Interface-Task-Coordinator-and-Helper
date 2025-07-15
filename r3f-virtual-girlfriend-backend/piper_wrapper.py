#!/usr/bin/env python3

import sys
import wave
import os
from piper import PiperVoice

def main():
    if len(sys.argv) != 4:
        print("Usage: python3 piper_wrapper.py <voice_path> <output_path> <text>")
        sys.exit(1)
    
    voice_path = sys.argv[1]
    output_path = sys.argv[2]
    text = sys.argv[3]
    
    try:
        # Load the voice
        voice = PiperVoice.load(voice_path)
        
        # Generate speech
        with wave.open(output_path, "wb") as wav_file:
            voice.synthesize_wav(text, wav_file)
        
        print(f"SUCCESS: Audio saved to {output_path}")
        
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
