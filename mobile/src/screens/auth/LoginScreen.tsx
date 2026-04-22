import React from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';

export default function LoginScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white justify-center px-6" style={{ flex: 1, backgroundColor: '#ffffff', justifyContent: 'center', paddingHorizontal: 24 }}>

      <View className="items-center mb-10">
        <Text className="text-4xl font-bold text-primary mb-2">Tabeebi+</Text>
        <Text className="text-gray-500 text-center text-base">Kliniğinize ve randevularınıza ulaşmak için giriş yapın.</Text>
      </View>
      
      <View className="w-full mb-6">
        <Text className="text-gray-700 font-semibold mb-2 ml-1">Telefon Numarası</Text>
        <TextInput 
          className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 text-base text-gray-800"
          placeholder="05XX XXX XX XX"
          keyboardType="phone-pad"
          placeholderTextColor="#9ca3af"
        />
      </View>

      <TouchableOpacity className="w-full bg-primary py-4 rounded-2xl items-center shadow-md">
        <Text className="text-white font-bold text-lg">Devam Et</Text>
      </TouchableOpacity>
      
      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-500">Hasta değil, doktor musunuz? </Text>
        <TouchableOpacity>
          <Text className="text-primary font-semibold">Uzman Girişi</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
