#!/usr/bin/env python3

import wave
import sys
import os

try:
    from piper import PiperVoice

    # Load the voice model (downloaded to current directory)
    voice_path = "/Volumes/TRANSCEND_2TB/ai-assistant/en_GB-alba-medium.onnx"
    print(f"Loading voice from: {voice_path}")

    voice = PiperVoice.load(voice_path)
    print(f"Voice loaded successfully!")
    print(f"Sample rate: {voice.config.sample_rate}")
    print(f"Num speakers: {voice.config.num_speakers}")

    # Test synthesis
    text = "Hello, this is a test of the Piper text-to-speech system."
    output_path = "/Volumes/TRANSCEND_2TB/ai-assistant/piper_test.wav"

    print(f"Synthesizing: {text}")
    with wave.open(output_path, "wb") as wav_file:
        voice.synthesize_wav(text, wav_file)

    print(f"Audio saved to: {output_path}")

    # Check file size
    if os.path.exists(output_path):
        size = os.path.getsize(output_path)
        print(f"File size: {size} bytes")

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
