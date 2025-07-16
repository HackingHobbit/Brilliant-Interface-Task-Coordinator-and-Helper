# Installation Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Python 3** with pip
3. **LM Studio** installed and running
4. **Git** for cloning the repository

## Quick Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/HackingHobbit/Brilliant-Interface-Task-Coordinator-and-Helper.git
   cd Brilliant-Interface-Task-Coordinator-and-Helper/brilliant-interface
   ```

2. **Install all dependencies**
   ```bash
   npm run setup
   ```

3. **Configure environment**
   ```bash
   cp core/backend/.env.example core/backend/.env
   cp core/frontend/.env.example core/frontend/.env
   ```

4. **Install Piper TTS**
   ```bash
   pip install piper-tts
   ```

5. **Start LM Studio**
   - Open LM Studio
   - Load your preferred model
   - Start the local server (default: http://localhost:1234)

6. **Start the application**
   ```bash
   npm run dev
   ```

7. **Open browser**
   Navigate to http://localhost:5173

## Manual Setup

If you prefer to set up components individually:

### Backend Setup
```bash
cd core/backend
npm install
npm start
```

### Frontend Setup
```bash
cd core/frontend
npm install
npm run dev
```

## Troubleshooting

- **Voice files not found**: Ensure voice models are in `media/assets/voices/`
- **LM Studio connection failed**: Check that LM Studio is running on port 1234
- **Piper TTS errors**: Verify Python 3 and piper-tts are installed correctly
