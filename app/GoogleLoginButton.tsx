import * as AuthSession from "expo-auth-session";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect } from "react";
import { Alert, Text, TouchableOpacity } from "react-native";
import { account } from "./Client";

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
      const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
      const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;

      if (!projectId || !endpoint) throw new Error("Appwrite configuration is missing.");


      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "movieapp",
      });

      console.log("[GoogleLogin] redirectUri:", redirectUri);

      const authUrl = `${endpoint}/account/sessions/oauth2/google?project=${projectId}&success=${encodeURIComponent(
        redirectUri
      )}&failure=${encodeURIComponent(redirectUri)}`;

      console.log("[GoogleLogin] authUrl:", authUrl);

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type !== "success") return;

      const { queryParams } = Linking.parse(result.url);
      console.log("[GoogleLogin] Parsed params:", queryParams);

      if (queryParams?.error) throw new Error(`Appwrite login failed: ${queryParams.error}`);

      const secret = queryParams?.secret;
      const userId = queryParams?.userId;

      if (!secret || !userId) throw new Error(`Invalid response from Google login. URL: ${result.url}`);

      // Complete Appwrite session
      await account.createSession(userId as string, secret as string);

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
