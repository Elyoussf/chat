// Nkk/profile.js
import React from "react";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const Profile = ({ setShowModal }) => {
  const handleProfilePress = () => {
    setShowModal(true);
  };

  return (
    <TouchableOpacity onPress={handleProfilePress}>
      <AntDesign name="user" size={40} color="black" />
    </TouchableOpacity>
  );
};

export default Profile;
