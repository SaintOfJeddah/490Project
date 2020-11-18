import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Image, StyleSheet, Text, View, Dimensions } from "react-native";
import HoldButton from "/FCIT/SEM 7/490/amongus/components/HoldButton.jsx";
import KeyPad from "./components/KeyPad.jsx";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import * as firebase from "firebase";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

var firebaseConfig = {
  apiKey: "AIzaSyDeGXVSmZO6EAOYRDDcSSw98SKYPiMB2OE",
  authDomain: "esp8266-38237.firebaseapp.com",
  databaseURL: "https://esp8266-38237.firebaseio.com",
  projectId: "esp8266-38237",
  storageBucket: "esp8266-38237.appspot.com",
  messagingSenderId: "395635698202",
  appId: "1:395635698202:web:491a90b12c7803a5073fa3",
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
let db = firebase.database();

// db.ref("/AmongUS/Game_Settings/game_started").on("value", (snapshot) => {
//   console.log(": " + snapshot.val());
// });

var playersRef = db.ref("AmongUS/currentPlayers/");

var gameStarted = db.ref("AmongUS/Game_Settings/game_started");

function Home() {
  return (
    <View style={styles.container}>
      <Text>Your name: </Text>
      <TextInput style={styles.TextInput}></TextInput>
      <Text>Device id: </Text>
      <TextInput style={styles.TextInput}></TextInput>
    </View>
  );
}

class AdminPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      players: [],
    };
    playersRef.on("value", (snapshot) => {
      this.setState({ players: snapshot.val() });
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.button}>
          <Text>Start Game</Text>
        </TouchableOpacity>
        {this.state.players.map((player) => {
          return (
            <Image
              style={styles.image}
              source={require(`./assets/${player.color}`)}
            ></Image>
          );
        })}
      </View>
    );
  }
}

function App() {
  const [imposter, isImposter] = useState(false);

  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Admin Page" component={AdminPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  TextInput: {
    margin: 10,
    width: windowWidth * 0.5,
    height: windowHeight * 0.05,
    borderWidth: 1,
    borderRadius: 25,
    borderColor: "black",
  },

  button: {
    width: windowWidth * 0.3,
    justifyContent: "center",
    alignItems: "center",
    height: windowHeight * 0.08,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 25,
  },

  image: {
    width: 128,
    height: 128,
  },
});

export default App;
