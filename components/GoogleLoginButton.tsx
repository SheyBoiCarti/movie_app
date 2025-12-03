import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { OAuthProvider } from "react-native-appwrite";
import { account } from "../lib/Client";

WebBrowser.maybeCompleteAuthSession();

interface GoogleLoginButtonProps {
  onLoginSuccess?: (user: any) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onLoginSuccess }) => {
  useEffect(() => {
    WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      // Create OAuth2 session using Appwrite SDK
      const redirectUri = Linking.createURL("");
      console.log("[GoogleLogin] redirectUri:", redirectUri);

      // Start the OAuth2 flow - this returns the URL to open
      const authUrl = account.createOAuth2Token(
        OAuthProvider.Google,
        redirectUri, // success
        redirectUri  // failure
      );

      console.log("[GoogleLogin] authUrl:", authUrl);

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl.toString(),
        redirectUri
      );

      if (result.type !== "success") {
        console.log("[GoogleLogin] WebBrowser result type:", result.type);
        return;
      }

      console.log("[GoogleLogin] Result URL:", result.url);

      let secret: string | null | undefined;
      let userId: string | null | undefined;

      // Parse the returned URL for secret and userId
      const parsed = Linking.parse(result.url);
      secret = parsed.queryParams?.secret as string | undefined;
      userId = parsed.queryParams?.userId as string | undefined;

      // Try fragment if query params are empty
      if (!secret || !userId) {
        const hashIndex = result.url.indexOf("#");
        if (hashIndex !== -1) {
          const fragment = result.url.substring(hashIndex + 1);
          const params = new URLSearchParams(fragment);
          secret = params.get("secret") ?? undefined;
          userId = params.get("userId") ?? undefined;
        }
      }

      console.log("[GoogleLogin] Parsed userId:", userId, "secret:", secret ? "***" : "missing");

      if (!secret || !userId) {
        throw new Error(`Invalid response from Google login. URL: ${result.url}`);
      }

      // Create the session with the token
      await account.createSession(userId, secret);

      const user = await account.get();
      console.log("[GoogleLogin] Logged in user:", user);

      if (onLoginSuccess) onLoginSuccess(user);
    } catch (error: any) {
      console.error("[GoogleLogin] login failed:", error);
      Alert.alert("Login Failed", error?.message || "Google login failed. Please try again.");
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
