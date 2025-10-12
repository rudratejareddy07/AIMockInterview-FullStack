# **App Name**: AI Interview Ace

## Core Features:

- User Authentication: Secure login/signup using email/password (JWT or Clerk/Firebase).
- AI-Powered Video Interviews: Conduct live AI mock interviews via video call using WebRTC, Daily, Agora or LiveKit integrations with LIVEKIT_URL=wss://aimockinterview-q4bdwxkh.livekit.cloud LIVEKIT_API_KEY=APIFgWSurxZNEMR LIVEKIT_API_SECRET=7cCT3AlAiHeJU6sSRc6HWeDPIlGwwKLrrdhEe53mLrEA token:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjAyNTY5NzAsImlkZW50aXR5IjoiMiIsImlzcyI6IkFQSUZnV1N1cnhaTkVNUiIsIm5iZiI6MTc2MDI1NjA3MCwic3ViIjoiMiIsInZpZGVvIjp7ImNhblB1Ymxpc2giOnRydWUsImNhblB1Ymxpc2hEYXRhIjp0cnVlLCJjYW5TdWJzY3JpYmUiOnRydWUsInJvb20iOiJpbnRlcnZpZXciLCJyb29tSm9pbiI6dHJ1ZX19.3rMgLO5BXx7Ey9G7odVZkr6I1fxMXqFyTQ8UZxH15sg
- Real-time Speech-to-Text: Transcribe user answers in real-time using Whisper API or Deepgram.
- AI Feedback Generation: Generate detailed performance reports using the OpenAI API (gpt-4-turbo) tool based on technical accuracy, verbal fluency, and soft skills.
- Interview History: Allow users to view past interview sessions and feedback reports stored in MongoDB (userID, interviewType, date, AI feedback JSON).
- Performance Chart: Generate a progress chart for users.

## Style Guidelines:

- Primary color: Saturated blue (#29ABE2) to convey professionalism and confidence, reflecting a tech-forward yet reliable feel.
- Background color: Light, desaturated blue (#E5F6FD), offering a clean and calming backdrop that emphasizes content.
- Accent color: Vibrant orange (#FF8C00), placed for CTAs to draw user attention and inject energy.
- Headline font: 'Space Grotesk' sans-serif font to provide a techy, scientific feel, pairing with 'Inter' for body.
- Body font: 'Inter' sans-serif, which provides a modern, objective, neutral look, is used for the body.
- Use modern, minimalist icons relevant to interview topics and feedback categories.
- Implement a modern dashboard layout with gradient cards, progress bars, and charts to visualize interview data and feedback.
- Incorporate smooth transitions and subtle animations using Framer Motion to enhance user engagement.