import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Clipboard,
  ToastAndroid, // For Android feedback
  Platform, // To check the platform for iOS feedback
} from "react-native";
import { Feather } from "@expo/vector-icons"; // For copy icon
import { Ionicons } from "@expo/vector-icons"; // For close icon

const UsernameModal = ({ isVisible, onClose, username }) => {
  const handleCopyToClipboard = async () => {
    if (username) {
      await Clipboard.setString(username);
      if (Platform.OS === "android") {
        ToastAndroid.show("Username copied!", ToastAndroid.SHORT);
      } else {
        Alert.alert("Copied!", "Username copied to clipboard.");
      }
      onClose(); // Close the modal after copying
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible}>
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Your Username:</Text>
          <Text style={styles.usernameText}>{username}</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={handleCopyToClipboard}
            >
              <Feather name="copy" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onClose}>
              <Ionicons name="close-outline" size={28} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start", // Align to the top
    alignItems: "flex-end", // Align to the right
    marginTop: 50, // Adjust as needed to be below the status bar
    marginRight: 10, // Adjust as needed to be near the profile icon
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: "black",
  },
  modalText: {
    marginBottom: 10,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  usernameText: {
    marginBottom: 15,
    fontSize: 14,
    color: "black",
  },
  buttonsContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 10,
  },
});

export default UsernameModal;
