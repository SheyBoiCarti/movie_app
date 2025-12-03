import { Account, Avatars, Client } from "react-native-appwrite";

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


export { client };

