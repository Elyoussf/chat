import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const handleSearch = async ({ setSpecialMessage, username, setList }) => {
  const url = `https://d7b0-196-200-133-182.ngrok-free.app/existing-friends/?username=${username}`;
  try {
    const res = await fetch(url);
    if (res.status === 403) {
      setSpecialMessage(
        "The server was not ok with your request. Maybe you are offline!",
      );
    } else {
      const response = await res.json();
      console.log(response);
      setSpecialMessage("Here are your available friends:");
      setList(response.friends || []);
    }
  } catch (err) {
    setSpecialMessage("An error occurred. Please try again!");
    console.error("Error: ", err);
  }
};

function Search({ navigation }) {
  const [username, setUsername] = useState("");
  const [specialMessage, setSpecialMessage] = useState("");
  const [list, setList] = useState([]);

  useEffect(() => {
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("username");
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          navigation.navigate("Login");
        }
      } catch (error) {
        navigation.navigate("Login");
        console.error("Error retrieving username from storage: ", error);
      }
    };
    getUsername();
  }, [navigation]);

  const renderFriend = ({ item }) => (
    <TouchableOpacity style={styles.friendItem}>
      <Text style={styles.friendText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={() => handleSearch({ setSpecialMessage, username, setList })}
      >
        <Text style={styles.searchButtonText}>Search for online friends</Text>
      </TouchableOpacity>
      {specialMessage ? (
        <View style={styles.messageContainer}>
          <Text style={styles.specialMessage}>{specialMessage}</Text>
          {list && list.length > 0 ? (
            <FlatList
              data={list.filter((e) => e !== username)}
              keyExtractor={(item) => item}
              renderItem={renderFriend}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <Text style={styles.noFriendsText}>No friends found.</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  searchButton: {
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  messageContainer: {
    marginTop: 16,
  },
  specialMessage: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  listContainer: {
    marginTop: 8,
  },
  friendItem: {
    padding: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
    marginBottom: 8,
  },
  friendText: {
    fontSize: 16,
    color: "#333",
  },
  noFriendsText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 16,
  },
});

export default Search;
