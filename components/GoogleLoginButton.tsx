import * as AuthSession from "expo-auth-session";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { Models, OAuthProvider } from "react-native-appwrite";

import { account, client } from "../lib/Client";

interface GoogleLoginButtonProps {
  onLoginSuccess?: (user: Models.User<Models.Preferences>) => void;
}


const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onLoginSuccess }) => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    let isExpoGo = false;
    let expoProxyRedirectUri: string | undefined;
    try {
      const configuredProjectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
      const clientProjectId = client.config.project;

      // IMPORTANT: The callback scheme must match what is registered in app.json
      // (and therefore what is built into the native app). If you change the projectId
      // at runtime via env vars without rebuilding, the redirect will open in the browser
      // and never return to the app.
      const projectId = clientProjectId;

      if (!projectId) {
        throw new Error(
          "Missing Appwrite project id. Set EXPO_PUBLIC_APPWRITE_PROJECT_ID or configure the Appwrite client."
        );
      }

      if (configuredProjectId && configuredProjectId !== clientProjectId) {
        console.warn(
          "[GoogleLogin] EXPO_PUBLIC_APPWRITE_PROJECT_ID does not match lib/Client project id. " +
            "Using the client project id to keep the callback scheme valid.",
          { configuredProjectId, clientProjectId }
        );
      }

      const executionEnvironment = (Constants as any).executionEnvironment;
      const appOwnership = (Constants as any).appOwnership;
      isExpoGo =
        executionEnvironment === "storeClient" || appOwnership === "expo";

      // Appwrite magic redirect format (do not change):
      // appwrite-callback-<projectId>://auth
      const nativeRedirectUri = `appwrite-callback-${projectId}://auth`;
      expoProxyRedirectUri = AuthSession.makeRedirectUri({ useProxy: true });

      // In Expo Go, custom schemes like appwrite-callback-... are not registered,
      // which causes the web flow to hang on redirect. Use the Expo AuthSession proxy.
      const redirectUri = isExpoGo ? expoProxyRedirectUri : nativeRedirectUri;

      const response = account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUri,
        redirectUri
      );

      if (!response) {
        throw new Error("Failed to create OAuth URL. Ensure Google OAuth is enabled in Appwrite and your redirect URL is allowlisted in Appwrite Platform settings.");
      }

      // Native builds: open the provider in the system browser and rely on the deep-link
      // callback route (`/auth`) to exchange the one-time token. This avoids cases where
      // `openAuthSessionAsync` reports cancel/dismiss due to Android system popups.
      if (!isExpoGo) {
        await WebBrowser.openBrowserAsync(response.toString());
        return;
      }

      // Expo Go: use AuthSession proxy and read the returned URL directly.
      const result = await WebBrowser.openAuthSessionAsync(
        response.toString(),
        redirectUri
      );

      if (result.type !== "success") {
        // cancel/dismiss
        return;
      }

      const returnedUrl = (result as any).url as string | undefined;
      if (!returnedUrl) {
        throw new Error("OAuth completed but no redirect URL was returned.");
      }

      const url = new URL(returnedUrl);
      const secret = url.searchParams.get("secret");
      const userId = url.searchParams.get("userId");

      if (!userId || !secret) {
        console.error("[GoogleLogin] Missing userId/secret in redirect.", { returnedUrl });
        throw new Error("Login succeeded but session data was missing. Check your Appwrite OAuth redirect settings.");
      }

      await account.createSession(userId, secret);

      const user = await account.get();
      onLoginSuccess?.(user);
    } catch (error: any) {
      console.error("[GoogleLogin] login failed:", error);
      let hint = "";
      if (isExpoGo) {
        let hostname = "auth.expo.io";
        try {
          if (expoProxyRedirectUri) hostname = new URL(expoProxyRedirectUri).hostname;
        } catch {
          // ignore
        }
        hint =
          `\n\nYou're running in Expo Go. Appwrite must allow the Expo proxy redirect host.` +
          `\nAdd a Web platform in Appwrite with hostname: ${hostname}` +
          `\n(or use a custom development build and avoid the proxy).`;
      }
      Alert.alert(
        "Login Failed",
        (error?.message || "Google login failed. Please try again.") + hint
      );
    }
  }, [onLoginSuccess]);

  return (
    <TouchableOpacity
      onPress={loginWithGoogle}
      className="bg-white flex-row justify-center items-center p-4 rounded-full w-full mt-5 shadow-md"
    >
      <Text className="text-black font-bold text-lg">Login with Google</Text>
    </TouchableOpacity>
  );
};

export default GoogleLoginButton;
