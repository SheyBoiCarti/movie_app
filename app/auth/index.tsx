import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { account } from "@/lib/Client";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; secret?: string }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
        const secret = Array.isArray(params.secret) ? params.secret[0] : params.secret;

        if (!userId || !secret) {
          // If the app is opened at /auth without the OAuth params, just send them to Profile.
          router.replace("/(tabs)");
          return;
        }

        await account.createSession(userId, secret);

        router.replace("/(tabs)");
      } catch (e: any) {
        if (cancelled) return;
        setError(e?.message || "Failed to finish login.");
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
    // We intentionally only react to the values we need.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.userId, params.secret, router]);

  return (
    <View className="flex-1 bg-primary items-center justify-center px-6">
      {error ? (
        <Text className="text-red-500 text-center">{error}</Text>
      ) : (
        <>
          <ActivityIndicator size="large" color="#AB8BFF" />
          <Text className="text-white mt-4">Finishing login…</Text>
        </>
      )}
    </View>
  );
}
