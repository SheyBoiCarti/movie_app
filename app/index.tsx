import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
   <View className='flex-1 justify-center items-center'>
    <Text className="text-5xl text-dark-100 font-center" > Welcome to my movie app</Text>

    <Link href='/onboarding'> Onboarding</Link>
    </View>
  );
}
