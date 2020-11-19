import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ScrollView,
  Alert,
} from "react-native";
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
var randomPlayer = db.ref(
  `AmongUS/currentPlayers/${1 + parseInt(Math.random() * 5)}`
);

var gameStarted = db.ref("AmongUS/Game_Settings/game_started");

const colors = {
  black: {
    alive: "./assets/black.png",
    dead: "./assets/black_dead.png",
  },

  red: {
    alive: "./assets/red.png",
    dead: "./assets/red_dead.png",
  },
  green: {
    alive: "./assets/green.png",
    dead: "./assets/green_dead.png",
  },

  orange: {
    alive: "./assets/orange.png",
    dead: "./assets/orange_dead.png",
  },

  blue: {
    alive: "./assets/blue.png",
    dead: "./assets/blue_dead.png",
  },
};

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
      startButton: null,
    };

    playersRef.on("value", (snapshot) => {
      this.setState({ players: snapshot.val() });
      console.log(`ARRAY: ${this.state.players}`);
    });

    gameStarted.on("value", (snapshot) => {
      if (snapshot.val() == true) {
        this.setState({
          startButton: <Text>Game Already started, reset to start again.</Text>,
        });
      } else {
        this.setState({
          startButton: (
            <TouchableOpacity
              onPress={() => {
                if (
                  !(
                    this.state.players == null || this.state.players.length == 0
                  )
                ) {
                  randomPlayer.update({ imposter: true });
                }
                db.ref("/AmongUS/Game_Settings/").update({
                  game_started: true,
                });
              }}
              style={styles.button}
            >
              <Text>Start Game</Text>
            </TouchableOpacity>
          ),
        });
      }
    });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.startButton}
        <TouchableOpacity
          onPress={() => {
            playersRef.remove();
            db.ref("/AmongUS/Game_Settings/").update({ game_started: false });
          }}
          style={[styles.button, { marginBottom: 30 }]}
        >
          <Text>Reset Game</Text>
        </TouchableOpacity>
        <ScrollView
          contentContainerStyle={{
            width: windowWidth,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {() => {
            this.state.players == null ? (
              <Text>{"Not enough players"}</Text>
            ) : (
              this.state.players.map((player) => {
                var imageSrc = () => {
                  if (player.color == "black") {
                    return (
                      <Image
                        style={styles.image}
                        source={require("./assets/black.png")}
                      ></Image>
                    );
                  } else if (player.color == "red") {
                    return (
                      <Image
                        style={styles.image}
                        source={require("./assets/red.png")}
                      ></Image>
                    );
                  } else if (player.color == "green") {
                    return (
                      <Image
                        style={styles.image}
                        source={require("./assets/green.png")}
                      ></Image>
                    );
                  } else if (player.color == "orange") {
                    return (
                      <Image
                        style={styles.image}
                        source={require("./assets/orange.png")}
                      ></Image>
                    );
                  } else {
                    return (
                      <Image
                        style={styles.image}
                        source={require("./assets/blue.png")}
                      ></Image>
                    );
                  }
                };
                return (
                  <View>
                    <Text style={{ fontSize: 18, textAlign: "center" }}>
                      {`Name: ${player.name}\nImposter?: ${player.imposter}`}
                    </Text>
                    {imageSrc()}
                  </View>
                );
              })
            );
          }}
        </ScrollView>
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
    marginTop: 20,
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
