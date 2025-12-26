import { images } from "@/constants/images";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Text, TouchableOpacity, View } from "react-native";
import { Models } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import { account, avatars } from "../../lib/Client";

const Login = () => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const checkUser = useCallback(async (currentUser?: Models.User<Models.Preferences>) => {
    try {
      if (!currentUser) {
        currentUser = await account.get();
      }
      setUser(currentUser);
      if (currentUser) {
        // Get user initials avatar
        const avatar = avatars.getInitials(currentUser.name);
        setAvatarUrl(avatar.toString());
      }
    } catch (error) {
      // Not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  // When coming back from the OAuth callback (/auth), this screen is usually already mounted.
  // Refresh on focus so the UI updates from "Login" -> "Welcome" immediately.
  useFocusEffect(
    useCallback(() => {
      void checkUser();
    }, [checkUser])
  );

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      setAvatarUrl(null);
      Alert.alert("Success", "Logged out successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary justify-center items-center">
        <ActivityIndicator size="large" color="#AB8BFF" />
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full h-full z-0 opacity-60"
        resizeMode="cover"
      />
      <SafeAreaView className="flex-1 justify-center items-center px-5">
        {user ? (
          <View className="items-center w-full">
            <View className="w-24 h-24 rounded-full bg-accent justify-center items-center mb-4 overflow-hidden border-2 border-white">
               {avatarUrl ? (
                 <Image source={{ uri: avatarUrl }} className="w-full h-full" />
               ) : (
                 <Text className="text-3xl font-bold text-primary">{user.name.charAt(0)}</Text>
               )}
            </View>
            <Text className="text-2xl font-bold text-white mb-2">Welcome, {user.name}!</Text>
            <Text className="text-light-200 mb-8">{user.email}</Text>
            
            <TouchableOpacity
              onPress={handleLogout}
              className="bg-red-500/20 border border-red-500 px-8 py-3 rounded-full"
            >
              <Text className="text-red-500 font-bold text-lg">Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="items-center w-full">
            <Text className="text-3xl font-bold text-white mb-2">Welcome Back</Text>
            <Text className="text-light-200 mb-8 text-center">
              Login to save your favorite movies and sync across devices
            </Text>
            <GoogleLoginButton onLoginSuccess={checkUser} />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default Login;
