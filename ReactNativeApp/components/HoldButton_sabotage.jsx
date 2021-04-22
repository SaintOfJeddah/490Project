import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import * as firebase from "firebase";


const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

export default class HoldButton extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      colors: [false, false, false],
      progress: 0,
    };
  }

  download = setInterval(() => {
    if (this.state.colors[0] && this.state.colors[1] && this.state.colors[2]) {
      Alert.alert("download started");
      clearInterval(this.download);
      startDownload = setInterval(() => {
        if (this.state.progress != 100) {
          this.setState({ progress: this.state.progress + 20 });
        } else {
          clearInterval(startDownload);
          this.props.route.params.db.ref("AmongUS/current_game_settings/sabotageCounter").once("value", (snapshot) => {
            var count = snapshot.val();
            count++;
            this.props.route.params.db.ref("AmongUS/current_game_settings/").update({sabotageCounter:count});
          });
          this.props.route.params.db.ref("AmongUS/current_game_settings/sabotageCounter").on("value", (snapshot) => {
            if (snapshot.val()==4){
              this.props.navigation.goBack();
            }
          });
          //
        }
      }, 2000);
    }
  }, 500);

  render() {
    return (
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 24,
            alignSelf: "center",
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          Press and Hold the Node buttons to initiate download
        </Text>
        <TouchableOpacity
          onLongPress={() => {
            newColors = this.state.colors;
            newColors[0] = true;
            this.setState({ colors: newColors });
          }}
          style={{
            backgroundColor: this.state.colors[0] ? "green" : "transparent",
            margin: 10,
            width: width * 0.4,
            height: height * 0.1,
            borderWidth: 1,
            borderColor: "black",
            borderRadius: 25,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 28, alignSelf: "center" }}>NodeONE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onLongPress={() => {
            newColors = this.state.colors;
            newColors[1] = true;
            this.setState({ colors: newColors });
          }}
          style={{
            backgroundColor: this.state.colors[1] ? "green" : "transparent",
            margin: 10,
            width: width * 0.4,
            height: height * 0.1,
            borderWidth: 1,
            borderColor: "black",
            borderRadius: 25,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 28, alignSelf: "center" }}>NodeTWO</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onLongPress={() => {
            newColors = this.state.colors;
            newColors[2] = true;
            this.setState({ colors: newColors });
          }}
          style={{
            backgroundColor: this.state.colors[2] ? "green" : "transparent",
            margin: 10,
            width: width * 0.4,
            height: height * 0.1,
            borderWidth: 1,
            borderColor: "black",
            borderRadius: 25,
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 28, alignSelf: "center" }}>NodeTHREE</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 24, alignSelf: "center", marginTop: 30 }}>
          {this.state.progress + "%"}
        </Text>
      </View>
    );
  }
}
