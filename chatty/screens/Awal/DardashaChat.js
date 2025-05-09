import React, { useEffect, useRef, useState, useCallback } from "react";
import AntDesign from '@expo/vector-icons/AntDesign';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Feather from "react-native-vector-icons/Feather";

const MessageComponent = ({ msg }) => {
  const messageAlignment = msg.mine ? "flex-end" : "flex-start";
  const messageColor = msg.mine ? "#DCF8C6" : "#FFFFFF";
  const messageStyle = msg.mine ? styles.senderBubble : styles.receiverBubble;

  return (
    <View style={[styles.messageContainer, { alignSelf: messageAlignment }]}>
      <View style={[styles.messageBubble, messageStyle]}>
        <Text style={styles.messageText}>{msg.payload}</Text>
        <Text style={styles.messageTime}>{msg.time}</Text>
      </View>
    </View>
  );
};

const DardashaChat = ({
  friend,
  onBack,
  setFinish,
  msg,
  setSendMsg,
  setNewMsg,
  setUservslastmessage,
  newusername,
  messagesPerUser,
  setMessagesPerUser
}) => {
  const handleBackPress = useCallback(() => {
    if (onBack) {
      onBack();
    }
  }, [onBack]);

  const [allMessages, setAllMessages] = useState([]);
  const [newWrittenMsg, setNewWrittenMsg] = useState("");
  const scrollRef = useRef();
  const [initialLoad, setInitialLoad] = useState(false);
  const allMessagesRef = useRef(allMessages);

  useEffect(() => {
    allMessagesRef.current = allMessages;
  }, [allMessages]);

  useEffect(() => {
    const user = friend || newusername;
    if (messagesPerUser[user]) {
      setAllMessages(messagesPerUser[user]);
    } else {
      setAllMessages([]);
    }
    setInitialLoad(true);
  }, []);

  useEffect(() => {
    if (msg && msg.payload) {
      const isMessageAlreadyPresent = allMessagesRef.current.some(
        (existingMsg) => existingMsg.time === msg.time && existingMsg.payload === msg.payload
      );
     
      if (!isMessageAlreadyPresent) {
        setAllMessages(prev => [...prev, msg]);

        setMessagesPerUser(prev => {
          const user = friend || newusername;
          return {
            ...prev,
            [user]: [...(prev[user] || []), msg]
          };
        });

        setUservslastmessage(prev => {
          const user = newusername || friend;
          return { ...prev, [user]: msg.payload };
        });

        setNewMsg("");
        
        scrollRef.current?.scrollToEnd({ animated: true });
      }
    }
  }, [msg]);

  const handleSend = () => {
    if (newWrittenMsg.trim() === "") return;
    let now = new Date();
    let currentTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const newMsg = {
      mine: true,
      time: currentTime,
      payload: newWrittenMsg,
      receiver: friend
    };

    setAllMessages(prev => [...prev, newMsg]);

    setMessagesPerUser(prev => {
      return {
        ...prev,
        [friend]: [...(prev[friend] || []), newMsg]
      };
    });

    setUservslastmessage(prev => ({ ...prev, [friend]: newMsg.payload }));

    setNewWrittenMsg("");
    setSendMsg(newMsg);
    setFinish(true);

    scrollRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <StatusBar backgroundColor="#075E54" barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <AntDesign name="arrowleft" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerUserInfo}>
          <Text style={styles.headerTitle}>
            {friend ? friend : newusername}
          </Text>
          <Text style={styles.headerSubtitle}>online</Text>
        </View>
        
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="video" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="phone" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Feather name="more-vertical" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Chat Background */}
      <View style={styles.chatBackground}>
        <ScrollView 
          ref={scrollRef} 
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
        >
          {allMessages.map((message, index) => (
            <MessageComponent key={index} msg={message} />
          ))}
        </ScrollView>
      </View>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity style={styles.emojiButton}>
            <Feather name="smile" size={24} color="#657786" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder={`Message`}
            placeholderTextColor="#8E8E93"
            value={newWrittenMsg}
            onChangeText={setNewWrittenMsg}
            multiline
          />
          
          <TouchableOpacity style={styles.attachButton}>
            <Feather name="paperclip" size={24} color="#657786" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cameraButton}>
            <Feather name="camera" size={24} color="#657786" />
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.sendButton} 
          onPress={handleSend}
        >
          {newWrittenMsg.trim() === "" ? (
            <Feather name="mic" size={24} color="white" />
          ) : (
            <Feather name="send" size={24} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5DDD5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#075E54",
    paddingVertical: 10,
    paddingHorizontal: 10,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  headerSubtitle: {
    color: "#A5F6CD",
    fontSize: 13,
  },
  headerIcons: {
    flexDirection: "row",
  },
  headerIcon: {
    padding: 5,
    marginLeft: 10,
  },
  chatBackground: {
    flex: 1,
    backgroundColor: "#E5DDD5",
    backgroundImage: "linear-gradient(rgba(229,221,213,0.9), rgba(229,221,213,0.9))",
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messagesContent: {
    paddingBottom: 10,
  },
  messageContainer: {
    marginVertical: 3,
    maxWidth: "80%",
  },
  messageBubble: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  senderBubble: {
    backgroundColor: "#DCF8C6",
    borderTopRightRadius: 4,
  },
  receiverBubble: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: "#000",
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    color: "#7F8C8D",
    alignSelf: "flex-end",
    marginTop: 2,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "#F6F6F6",
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 10,
    marginRight: 8,
  },
  emojiButton: {
    padding: 8,
  },
  textInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    paddingVertical: 10,
    color: "#000",
  },
  attachButton: {
    padding: 8,
  },
  cameraButton: {
    padding: 8,
  },
  sendButton: {
    backgroundColor: "#00A884",
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DardashaChat;