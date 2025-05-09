import React, { useState, useEffect } from "react";
import DardashaHome from "./DardashaHome";
import DardashaChat from "./DardashaChat";
import { Alert } from "react-native";

const Dardasha = ({ msg, setNewMsg, setFinish, newusername, setFriend, sendmsg, setSendMsg, uservslastmessage, setUservslastmessage }) => {
  const [currentChatUser, setCurrentChatUser] = useState(null);
  const [messagesPerUser, setMessagesPerUser] = useState({});
  const [notifications, setNotifications] = useState({});
  
  // Handle new incoming messages
  useEffect(() => {
    if (msg && msg.payload && !msg.mine) {
      const sender = msg.sender || newusername;
      
      // Update messages store for this user
      // setMessagesPerUser(prev => ({
      //   ...prev,
      //   [sender]: [...(prev[sender] || []), msg]
      // }));
      
      // Update last message in chat list
      setUservslastmessage(prev => ({
        ...prev,
        [sender]: msg.payload
      }));
      
      // If we're not currently chatting with this user, show notification
      if (currentChatUser !== sender) {
        // Create notification
        setNotifications(prev => ({
          ...prev,
          [sender]: (prev[sender] || 0) + 1
        }));
        
        // Show alert for new message
        Alert.alert(
          `New message from ${sender}`,
          msg.payload.length > 30 ? msg.payload.substring(0, 30) + '...' : msg.payload,
          [
            { text: "View", onPress: () => handleOpenChat(sender) },
            { text: "Later", style: "cancel" }
          ]
        );
      }
    }
  }, [msg]);

  // Function to handle opening a chat
  const handleOpenChat = (username) => {
    setCurrentChatUser(username);
    setFriend(username);
    
    // Clear notifications for this user when opening chat
    if (notifications[username]) {
      setNotifications(prev => ({
        ...prev,
        [username]: 0
      }));
    }
  };
  
  // Function to handle going back to home
  const handleBack = () => {
    console.log("Back handler in main component called");
    setCurrentChatUser(null);
    // Make sure we force re-render by updating state
    setFriend("");
  };

  return currentChatUser ? (
    <DardashaChat
      friend={currentChatUser}
      setFinish={setFinish}
      setNewMsg={setNewMsg}
      setFriend={setFriend}
      msg={msg}
      sendmsg={sendmsg}
      setSendMsg={setSendMsg}
      onBack={handleBack}
      uservslastmessage={uservslastmessage}
      setUservslastmessage={setUservslastmessage}
      newusername={newusername}
      messagesPerUser={messagesPerUser}
      setMessagesPerUser={setMessagesPerUser}
    />
  ) : (
    <DardashaHome 
      newusername={newusername} 
      openChat={handleOpenChat} 
      uservslastmessage={uservslastmessage} 
      setUservslastmessage={setUservslastmessage} 
      setFriend={setFriend}
      notifications={notifications}
    />
  );
};

export default Dardasha;