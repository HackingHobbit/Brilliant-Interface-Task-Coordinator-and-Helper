import { exec } from "child_process";
import { promises as fs } from "fs";
import path from "path";

// Piper TTS configuration
const PIPER_VOICE = process.env.PIPER_VOICE || "en_GB-alba-medium";
const VOICES_DIR = process.env.VOICES_DIR || path.resolve(process.cwd(), "../../media/assets/voices");

const execCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Command failed: ${command}`);
        console.error(`Error: ${error.message}`);
        console.error(`Stderr: ${stderr}`);
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

export const generateSpeech = async (text, outputPath) => {
  try {
    console.log(`Generating speech for: "${text}"`);

    // Use absolute path for the output
    const absoluteOutputPath = path.resolve(outputPath);
    const voiceModelPath = path.resolve(VOICES_DIR, `${PIPER_VOICE}.onnx`);

    console.log(`Voice model path: ${voiceModelPath}`);
    console.log(`Checking if voice file exists...`);

    // Check if voice file exists
    try {
      await fs.access(voiceModelPath);
      console.log(`Voice file found: ${voiceModelPath}`);
    } catch (error) {
      console.error(`Voice file not found: ${voiceModelPath}`);
      throw new Error(`Voice file not found: ${voiceModelPath}`);
    }

    // Escape text for shell command (handle quotes, apostrophes, newlines)
    const escapedText = text
      .replace(/\\/g, '\\\\')  // Escape backslashes first
      .replace(/"/g, '\\"')    // Escape double quotes
      .replace(/'/g, "\\'")    // Escape single quotes/apostrophes
      .replace(/\n/g, ' ')     // Replace newlines with spaces
      .replace(/\r/g, ' ');    // Replace carriage returns with spaces

    // Generate speech using Piper TTS
    const piperCommand = `echo "${escapedText}" | python3 -m piper --model "${voiceModelPath}" --output_file "${absoluteOutputPath}"`;
    console.log(`Running Piper command: ${piperCommand}`);
    await execCommand(piperCommand);

    // Verify the WAV file was created
    const stats = await fs.stat(absoluteOutputPath);
    console.log(`Audio file created: ${absoluteOutputPath} (${stats.size} bytes)`);

    return absoluteOutputPath;
  } catch (error) {
    console.error(`Failed to generate speech: ${error.message}`);
    throw error;
  }
};

export const audioFileToBase64 = async (filePath) => {
  try {
    const data = await fs.readFile(filePath);
    return data.toString("base64");
  } catch (error) {
    console.error(`Failed to read audio file: ${error.message}`);
    throw error;
  }
};
