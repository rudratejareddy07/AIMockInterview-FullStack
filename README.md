# AI Interview Ace

This is a Next.js project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app), using [Firebase Studio](https://firebase.google.com/studio).

## Getting Started

Follow these steps to get the development environment running on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### 1. Install Dependencies

First, navigate to your project directory in your terminal and install the necessary packages:

```bash
npm install
```

### 2. Set Up Environment Variables

The application requires API keys for LiveKit (for the video/audio interview room) and Google AI (for the generative AI features).

1.  Create a new file named `.env.local` in the root of your project directory. You can do this by copying the existing `.env` file:
    ```bash
    cp .env .env.local
    ```

2.  Open the `.env.local` file and add the following variables:

    ```
    # Get your Gemini API key from Google AI Studio: https://aistudio.google.com/app/apikey
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

    # Get your LiveKit keys from your LiveKit Cloud project settings: https://cloud.livekit.io/
    LIVEKIT_API_KEY="YOUR_LIVEKIT_API_KEY"
    LIVEKIT_API_SECRET="YOUR_LIVEKIT_API_SECRET"
    NEXT_PUBLIC_LIVEKIT_URL="YOUR_LIVEKIT_WEBSOCKET_URL"
    ```

3.  Replace the placeholder values (`YOUR_..._KEY`) with your actual keys.

### 3. Run the Development Servers

This project requires two processes to be running simultaneously in separate terminal windows:

1.  **Terminal 1: Run the Next.js App**
    This command starts the main web application.

    ```bash
    npm run dev
    ```
    Your application should now be running at [http://localhost:9002](http://localhost:9002).

2.  **Terminal 2: Run the Genkit AI Flows**
    This command starts the Genkit server, which powers the AI interviewer, transcription, and feedback generation.

    ```bash
    npm run genkit:watch
    ```
    This will start the AI flows and watch for any changes you make to the AI-related files.

You are now all set up! You can access the application in your browser and start testing locally.