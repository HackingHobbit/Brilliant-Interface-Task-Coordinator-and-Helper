

![Video Thumbnail](https://img.youtube.com/vi/EzzcEL_1o9o/maxresdefault.jpg)

[Video tutorial](https://youtu.be/EzzcEL_1o9o)

The frontend is [here](https://github.com/wass08/r3f-virtual-girlfriend-frontend).

## Setup

### Prerequisites
1. **LM Studio** - Install and run LM Studio with a loaded model
2. **ElevenLabs API Key** - For text-to-speech generation
3. **Rhubarb Lip Sync** - For lip synchronization

### Configuration
1. Create a `.env` file at the root of the repository to add your **ElevenLabs API Key**. Refer to `.env.example` for the environment variable names.

2. **Start LM Studio server** with CORS enabled:
   ```bash
   lms server start --cors
   ```
   Make sure your model is loaded (check with `lms ps`)

3. Download the **RhubarbLibrary** binary for your **OS** [here](https://github.com/DanielSWolf/rhubarb-lip-sync/releases) and put it in your `bin` folder. `rhubarb` executable should be accessible through `bin/rhubarb`.

### Running the Application
Start the development server with:
```bash
yarn
yarn dev
```

### Notes
- The application now uses **local LM Studio** instead of OpenAI/ChatGPT
- Default LM Studio endpoint: `http://localhost:1234`
- You can customize the LM Studio URL and model name in your `.env` file
