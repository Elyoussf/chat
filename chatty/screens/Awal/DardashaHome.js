import React, { useEffect } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  StyleSheet
} from "react-native";

const DardashaHome = ({
  openChat,
  uservslastmessage,
  newusername,
  setFriend,
  notifications
}) => {
  // Handle a new user or direct chat request
  useEffect(() => {
    if (newusername) {
      openChat(newusername);
      setFriend(newusername);
    } else {
      setFriend("");
    }
  }, [newusername]);

  return (
    <FlatList
      data={Object.keys(uservslastmessage)}
      keyExtractor={(item) => item}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => openChat(item)}
          style={styles.chatRow}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{item.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.chatInfo}>
            <Text style={styles.contactName}>{item}</Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.messagePreview}
            >
              {uservslastmessage[item] || "Tap to start chat"}
            </Text>
          </View>
          {notifications && notifications[item] > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{notifications[item]}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No chats yet</Text>
          <Text style={styles.emptyStateHint}>Start a new conversation</Text>
        </View>
      }
    />
  );
};

const styles = StyleSheet.create({
  chatRow: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: "#E2E2E2",
    backgroundColor: "#FFFFFF",
    alignItems: "center"
  },
  avatarCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#25D366",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF"
  },
  chatInfo: {
    flex: 1,
    justifyContent: "center"
  },
  contactName: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 3,
    color: "#000000"
  },
  messagePreview: {
    color: "#8C8C8C",
    fontSize: 14
  },
  emptyState: {
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
    height: 200
  },
  emptyStateText: {
    color: "#075E54",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 8
  },
  emptyStateHint: {
    color: "#8C8C8C",
    fontSize: 14
  },
  unreadBadge: {
    backgroundColor: "#25D366",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5
  },
  unreadCount: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12
  }
});

export default DardashaHome;