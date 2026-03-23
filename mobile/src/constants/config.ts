const config = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000",
  googleClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID ?? "",
};

export default config;
