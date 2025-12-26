import "react-native-url-polyfill/auto";

import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect } from "react";

import './globals.css';

import { client } from "../lib/Client";

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  useEffect(() => {
    client
      .ping()
      .then(() => console.log("[Appwrite] ping ok"))
      .catch((error) => console.error("[Appwrite] ping failed", error));
  }, []);

  return <Stack>
    <Stack.Screen
      name="auth"
      options={{
        headerShown: false,
      }}
    />

    <Stack.Screen
      name="(tabs)"
      options={{
        headerShown: false,
      }}
    />


    <Stack.Screen
      name="movies/[id]"
      options={{
        headerShown: false,
      }}
    />

    <Stack.Screen
      name="tv/episode"
      options={{
        headerShown: false,
      }}
    />
  </Stack>
    
}
