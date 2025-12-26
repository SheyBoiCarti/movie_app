import "react-native-url-polyfill/auto";

import { Account, Avatars, Client, Databases } from "react-native-appwrite";

const platform = "com.sheharyarn.movie_app";

export const client = new Client()
  .setProject("692fff110000e32f823a")
  .setEndpoint("https://fra.cloud.appwrite.io/v1")
  .setPlatform(platform);

export const ping = async () => {
  const endpoint = client.config.endpoint.replace(/\/$/, "");
  const url = new URL(`${endpoint}/ping`);
  return client.call("GET", url);
};

// react-native-appwrite doesn't currently expose `client.ping()`.
// Attach it for convenience so existing code can call `client.ping()`.
(client as any).ping = ping;

export const account = new Account(client);
export const avatars = new Avatars(client);
export const databases = new Databases(client);

// Database constants - using env vars with fallbacks
export const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || "69306ade001f50d66653";
export const FAVORITES_COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_FAVORITES_COLLECTION_ID || "favorites";

