import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Alert, Dimensions, StyleSheet, Text, View } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

const width = Dimensions.get("window").width;
const height = Dimensions.get("window").height;

export default class KeyPad extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      guess: "",
      number: parseInt(Math.random() * 9999999),
    };
  }

  render() {
    return (
      <View>
        <Text
          style={{
            fontSize: 22,
            marginBottom: 20,
            alignSelf: "center",
            textAlign: "center",
          }}
        >
          Today's password: {this.state.number}
        </Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {this.state.numbers.map((number) => {
            return (
              <TouchableOpacity
                onPress={() => {
                  this.setState({ guess: this.state.guess + number });
                }}
                style={{
                  backgroundColor: "transparent",
                  margin: 10,
                  width: width * 0.25,
                  height: height * 0.1,
                  borderWidth: 1,
                  borderColor: "black",
                  borderRadius: 25,
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 28, alignSelf: "center" }}>
                  {number}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          onPress={() => {
            if (this.state.number == parseInt(this.state.guess)) {
              Alert.alert("Correct Password!");
              this.setState({ guess: "" });
            } else {
              Alert.alert("Wrong Password! Try again");
              this.setState({ guess: "" });
            }
          }}
          style={{
            backgroundColor: "transparent",
            margin: 10,
            width: width * 0.45,
            height: height * 0.1,
            borderWidth: 1,
            borderColor: "black",
            borderRadius: 25,
            justifyContent: "center",
            alignSelf: "center",
          }}
        >
          <Text style={{ fontSize: 28, alignSelf: "center" }}>OK</Text>
        </TouchableOpacity>
        <Text
          style={{
            borderRadius: 1,
            borderColor: "black",
            maxWidth: width * 0.5,
            minWidth: width * 0.5,
            maxHeight: height * 0.1,
            minHeight: height * 0.1,
            alignSelf: "center",
            backgroundColor: "black",
            color: "green",
            textAlign: "center",
            fontSize: 36,
            marginTop: 20,
          }}
        >
          {this.state.guess}
        </Text>
      </View>
    );
  }
}
