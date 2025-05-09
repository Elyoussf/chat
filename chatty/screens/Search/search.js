import React, { useEffect, useState } from "react";
import Feather from '@expo/vector-icons/Feather';
import { useNavigation } from "@react-navigation/native";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  StatusBar,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const handleSearch = async ({ setSpecialMessage, username, setList }) => {
  const url =
    Platform.OS == "web"
      ? `http://localhost:8080/existing-friends?username=${username}`
      : `https://cfaf-196-200-133-182.ngrok-free.app/existing-friends?username=${username}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    const text = await res.text();
    console.log("Response Text:", text);
    try {
      const json = JSON.parse(text);
      setSpecialMessage("Here are your available friends:");
      setList(json.friends || []);
      console.log(json.friends)
    } catch (err) {
      console.error("JSON Parse Error:", err);
      setSpecialMessage("The response could not be parsed as JSON.");
    }
  } catch (err) {
    setSpecialMessage("An error occurred. Please try again!");
    console.error("Fetch Error: ", err);
  }
};

function Search({ wsConnected, onFriendSelect }) {
  const [username, setUsername] = useState("");
  const [specialMessage, setSpecialMessage] = useState("");
  const [list, setList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();
  const [refresh, setrefresh] = useState(false);

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

  useEffect(() => {
    if (!username || !wsConnected) return;
    handleSearch({ setSpecialMessage, username, setList });
  }, [username, wsConnected, refresh]);

  const filteredList = searchQuery 
    ? list.filter(item => 
        item.toLowerCase().includes(searchQuery.toLowerCase()) && 
        item !== username
      )
    : list.filter(item => item !== username);

  const renderFriend = ({ item }) => (
    <TouchableOpacity 
      style={styles.friendItem} 
      onPress={() => {
        onFriendSelect(item)
        navigation.navigate("Dardasha");
      }}
    >
      <View style={styles.avatarContainer}>
        <Text style={styles.avatarText}>{item.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item}</Text>
        <Text style={styles.lastMessage}>Tap to start chatting</Text>
      </View>
      <Text style={styles.timeStamp}>now</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />
      
      {/* Simplified Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chatty</Text>
        <TouchableOpacity style={styles.headerIcon} onPress={() => setrefresh(prev => !prev)}>
          <Feather name="refresh-cw" size={22} color="white" />
        </TouchableOpacity>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#7D8A96" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#7D8A96"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {specialMessage ? (
        <View style={styles.messageContainer}>
          {specialMessage !== "Here are your available friends:" && (
            <Text style={styles.specialMessage}>{specialMessage}</Text>
          )}
          
          {filteredList && filteredList.length > 0 ? (
            <FlatList
              data={filteredList}
              keyExtractor={(item) => item}
              renderItem={renderFriend}
              contentContainerStyle={styles.listContainer}
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <Feather name="users" size={60} color="#D0D6DD" />
              <Text style={styles.noFriendsText}>No contacts found</Text>
              <Text style={styles.noFriendsSubText}>
                {searchQuery ? "Try a different search" : "Refresh to find friends"}
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#075E54",
    paddingTop: Platform.OS === "ios" ? 48 : 12,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "600",
  },
  headerIcon: {
    padding: 5,
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  searchBar: {
    backgroundColor: "#F6F6F6",
    borderRadius: 20,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: "#37474F",
  },
  messageContainer: {
    flex: 1,
  },
  specialMessage: {
    fontSize: 14,
    margin: 16,
    color: "#d32f2f",
    textAlign: "center",
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
  },
  listContainer: {
    paddingBottom: 16,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ECEFF1",
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#075E54",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 22,
  },
  friendInfo: {
    flex: 1,
    justifyContent: "center",
  },
  friendName: {
    fontSize: 17,
    fontWeight: "500",
    color: "#202020",
    marginBottom: 3,
  },
  lastMessage: {
    fontSize: 14,
    color: "#8A8A8A",
  },
  timeStamp: {
    fontSize: 12,
    color: "#075E54",
    marginRight: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  noFriendsText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#636363",
    marginTop: 12,
  },
  noFriendsSubText: {
    fontSize: 14,
    color: "#8A8A8A",
    marginTop: 8,
    textAlign: "center",
  },
});

export default Search;