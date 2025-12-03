import { Account, Avatars, Client, Databases } from "react-native-appwrite";

// Ensure environment variables are defined
const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!;
const platform = "com.sheharyarn.movie_app";

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setPlatform(platform);

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);

// Database constants - using env vars with fallbacks
export const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "69306ade001f50d66653";
export const FAVORITES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID || "favorites";

export { client };

