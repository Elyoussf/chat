import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  Button,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

function Login({ navigation }) {
  const [accepted, setAccepted] = useState(""); // yes / no
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkExistingUser = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          navigation.navigate("Home");
        }
      } catch (error) {
        console.error("Error checking stored username:", error);
      }
    };

    checkExistingUser();
  }, []);

  const validateUsername = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter a username");
      return;
    }

    setIsLoading(true);

    try {
      // This URL format needs to match your server configuration
      const url =
        "https://d7b0-196-200-133-182.ngrok-free.app/user-validation?username=" +
        username;

      const response = await fetch(url);

      if (response.status === 200) {
        // Username is available
        await AsyncStorage.setItem("username", username);
        navigation.navigate("Home");
      } else if (response.status === 302) {
        // Username already exists
        Alert.alert(
          "Username Unavailable",
          "This username is already in use. Please try another one.",
        );
      } else {
        // Other error
        Alert.alert("Error", "Could not validate username. Please try again.");
      }
    } catch (err) {
      console.error("Network error:", err);
      Alert.alert(
        "Connection Error",
        "Could not connect to the server. Please check your internet connection and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Chat App</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isLoading}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#007bff" style={styles.loader} />
      ) : (
        <Button
          title="Login"
          onPress={validateUsername}
          disabled={!username.trim()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
  },
  input: {
    width: "80%",
    padding: 15,
    marginVertical: 15,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "white",
    fontSize: 16,
  },
  loader: {
    marginVertical: 15,
  },
});

export default Login;
