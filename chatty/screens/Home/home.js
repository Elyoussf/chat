import React, { useEffect, useRef, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import Octicons from "@expo/vector-icons/Octicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  ActivityIndicator,
  View,
  Alert,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Profile from "../Nkk/profile";
import UsernameModal from "../../modals/UsernameModal";
import Dardasha from "../Awal/dardasha";
import Search from "../Search/search";

const Tab = createBottomTabNavigator();

function HomeScreen({ navigation }) {
  
  const [uservslastmessage,setUservslastmessage] = useState({})
  const SERVER_URL = Platform.OS === "android" ? "wss://cfaf-196-200-133-182.ngrok-free.app" : "ws://localhost:8080";
  const [friend, setFriend] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [newmsg, setNewMsg] = useState("");
  const [sendmsg,setSendMsg] = useState("")
  const [finish, setFinish] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef(null);
  const reconnectAttempt = useRef(true);
  const [loading, setLoading] = useState(true);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const tabRef = useRef(null);

  const sendMessage = (messageObj, username) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.log("WebSocket not connected, can't send message");
      return false;
    }

    try {
      let now = new Date();
      let currentTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const message = {
        time: currentTime,
        typeMsg: "regular",

        ...messageObj,
      };

      wsRef.current.send(JSON.stringify(message));
      return true;
    } catch (e) {
      console.error("Error sending message:", e);
      return false;
    }
  };

  // Setup WebSocket connection
  const setupWebSocket = () => {
    if (!username) return;

    try {
      const ws = new WebSocket(
        `${SERVER_URL}/registered-user?username=${username}`,
      );

      ws.onopen = () => {
        console.log("WebSocket connected");
        setWsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setNewMsg(data);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onerror = (e) => {
        setWsConnected(false);
      };

      ws.onclose = (e) => {
        console.log("WebSocket closed:", e.code, e.reason);

        setWsConnected(false);

        // Try to reconnect if not intentionally closed
        if (
          reconnectAttempts.current < maxReconnectAttempts &&
          reconnectAttempt.current
        ) {
          reconnectAttempts.current++;
          setTimeout(setupWebSocket, 3000); // Retry after 3 seconds
        } else {
          AsyncStorage.removeItem("username");
          navigation.navigate("Login")
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error setting up WebSocket:", error);
    }
  };

  // Initial setup
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
        console.error("Error retrieving username:", error);
        Alert.alert("Error", "Could not retrieve your username");
        navigation.navigate("Login");
      } finally {
        setLoading(false);
      }
    };

    getUsername();
  }, [navigation]);

  // WebSocket connection effect
  useEffect(() => {
    if (username) {
      setupWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [username]);

  // Send message when finish state changes
  useEffect(() => {
    if (finish && sendmsg && username && wsConnected) {
      sendMessage({
        sender: username,
        receiver: sendmsg.receiver,
        payload: sendmsg.payload,
      });
      setFinish(false);
    }
  }, [finish, sendmsg, username, wsConnected]);

  const handleLogout = async () => {
    try {
      // Send logout message
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        sendMessage({
          typeMsg: "logout",
          sender: username,
          receiver:"System",
          payload: "",
        });

        // Close WebSocket
        // js should not reattempt Connection
        reconnectAttempt.current = false;
        wsRef.current.close();
      }

      // Clear stored username
      await AsyncStorage.removeItem("username");

      navigation.navigate("Login");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert(
        "Error",
        "Something went wrong during logout. Please try again.",
      );
    }
  };

  const handleSearchSelect = (selectedFriend) => {
    setFriend(selectedFriend);
    
  };
  

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
        translucent={false}
      />

      <View style={styles.header}>
        <View style={styles.statusIndicator}>
          <View
            style={[
              styles.statusDot,
              wsConnected ? styles.connected : styles.disconnected,
            ]}
          />
          <Text style={styles.statusText}>
            {wsConnected ? "Connected" : "Disconnected"}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <View style={styles.logoutButtonContent}>
            <SimpleLineIcons name="logout" size={24} color="black" />
            <Text style={styles.logoutText}>Logout</Text>
          </View>
        </TouchableOpacity>

        <Profile setShowModal={setShowModal} />
      </View>

      <Tab.Navigator
        ref={tabRef}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            elevation: 0,
            shadowOpacity: 0,
            borderTopWidth: 1,
            borderTopColor: "#f0f0f0",
          },
          tabBarIconStyle: { marginBottom: -5 },
          tabBarLabelStyle: { fontSize: 12 },
        }}
      >
        <Tab.Screen
          name="Search"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <FontAwesome
                  name="search-plus"
                  size={24}
                  color={focused ? "#007bff" : "gray"}
                />
                <Text
                  style={[styles.tabLabel, focused && styles.tabLabelFocused]}
                >
                  
                </Text>
              </View>
            ),
            tabBarLabel: () => null,
          }}
        >
          {(props) => (
            <Search
              {...props}
              navigation={navigation}
              wsConnected={wsConnected}
              onFriendSelect={handleSearchSelect}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Dardasha"
          options={{
            tabBarIcon: ({ focused }) => (
              <View style={styles.tabIconContainer}>
                <Octicons
                  name="comment-discussion"
                  size={24}
                  color={focused ? "#007bff" : "gray"}
                />
              </View>
            ),
            tabBarLabel: () => null,
          }}
        >
          {(props) => (
            <Dardasha
              {...props}
              msg={newmsg}
              setFriend = {setFriend}
              setFinish={setFinish}
              newusername={friend}
              sendmsg = {sendmsg}
              setSendMsg = {setSendMsg}
              setNewMsg = {setNewMsg}
              setUservslastmessage= {setUservslastmessage}
              uservslastmessage = {uservslastmessage}

            />
          )}
        </Tab.Screen>
      </Tab.Navigator>

      <UsernameModal
        isVisible={showModal}
        onClose={() => setShowModal(false)}
        username={username}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  connected: {
    backgroundColor: "#4CAF50",
  },
  disconnected: {
    backgroundColor: "#F44336",
  },
  statusText: {
    fontSize: 12,
    color: "#666",
  },
  logoutButton: {
    padding: 8,
  },
  logoutButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoutText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#333",
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "gray",
  },
  tabLabelFocused: {
    color: "#007bff",
  },
});

export default HomeScreen;

