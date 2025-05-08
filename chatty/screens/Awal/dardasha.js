import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import Feather from "@expo/vector-icons/Feather";

// Message component
const MessageComponent = ({ msg }) => (
  <View style={{ marginBottom: 10 }}>
    <Text style={{ fontWeight: "bold" }}>{msg.payload}</Text>
    <Text style={{ fontSize: 10, color: "gray" }}>{msg.time}</Text>
  </View>
);

function Dardasha({ msg, setNewMsg, setFinish }) {
  const [allMessages, setAllMessages] = useState([]);
  const [newWrittenMsg, setNewWrittenMsg] = useState("");
  const handleSend = () => {
    if (newWrittenMsg.trim() === "") return;
    const newMsg = {
      payload: newWrittenMsg,
      time: new Date().toLocaleTimeString(),
    };

    setAllMessages((prev) => [...prev, newMsg]);
    setNewMsg(newWrittenMsg); // optional: pass message to parent
    setFinish((prev) => !prev);
    setNewWrittenMsg("");
  };
  // Append new incoming message
  useEffect(() => {
    if (msg) {
      
      setAllMessages((prev) => [...prev, msg]);
    }
  }, [msg]);

  // Handle sending a message
 

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: "#fff" }}>
      <ScrollView style={{ flex: 1 }}>
        {allMessages.map((message, index) => (
          <MessageComponent key={index} msg={message} />
        ))}
      </ScrollView>

      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            padding: 8,
            marginRight: 10,
          }}
          placeholder="Type a message..."
          value={newWrittenMsg}
          onChangeText={setNewWrittenMsg}
        />
        <TouchableOpacity onPress={handleSend}>
          <Feather name="send" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default Dardasha;
