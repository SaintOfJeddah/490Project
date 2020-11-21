import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import HoldButton from "./components/HoldButton.jsx";
import KeyPad from "./components/KeyPad.jsx";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import * as firebase from "firebase";
import ProgressBar from "react-native-progress/Bar";

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

var playersRef = db.ref("AmongUS/currentPlayers/");
var imposterID = 1 + Math.floor(Math.random() * 5);
console.log(imposterID);
var randomPlayer = db.ref(`AmongUS/currentPlayers/` + imposterID);

var gameStarted = db.ref("AmongUS/Game_Settings/game_started");

let globalTasks = [];
db.ref("AmongUS/tasks_rfid").once("value", (snapshot) => {
  globalTasks = snapshot.val();
});

const colorsPath = {
  1: {
    false: require("./assets/red.png"),
    true: require("./assets/red_dead.png"),
  },

  2: {
    false: require("./assets/blue.png"),
    true: require("./assets/blue_dead.png"),
  },
  3: {
    false: require("./assets/green.png"),
    true: require("./assets/green_dead.png"),
  },

  4: {
    false: require("./assets/orange.png"),
    true: require("./assets/orange_dead.png"),
  },

  5: {
    false: require("./assets/black.png"),
    true: require("./assets/black_dead.png"),
  },
};

class Home extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate("Player Page")}
          style={styles.button}
        >
          <Text style={{ fontSize: 18 }}>Player</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => this.props.navigation.navigate("Admin Page")}
          style={styles.button}
        >
          <Text style={{ fontSize: 18 }}>Admin</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class AdminPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      players: null,
      startButton: (
        <TouchableOpacity
          onPress={() => {
            console.log(this.state.players);
            if (this.state.playersArray.length == 5) {
              randomPlayer.update({ imposter: true });
              db.ref("/AmongUS/Game_Settings/").update({
                game_started: true,
              });
            } else {
              Alert.alert("Not enough players to start game!");
            }
          }}
          style={styles.button}
        >
          <Text>Start Game</Text>
        </TouchableOpacity>
      ),
      playersArray: [],
    };

    playersRef.on("value", (snapshot) => {
      let tempPlayers = [];
      console.log("AAAA: " + snapshot.val());
      this.setState({ players: snapshot.val() });

      if (this.state.players != null) {
        Object.keys(this.state.players).forEach((key) => {
          // console.log(
          //   `Name: ${this.state.players[key].name}\nColor: ${this.state.players[key].color}`
          // );
          setTimeout(() => {}, 100);
          tempPlayers.push(this.state.players[key]);
          this.setState({ playersArray: tempPlayers });
        });
        // console.log(
        //   this.state.players.map((player) => {
        //     return `Name: ${player.name}\n${player.color}`;
        //   })
        // );
      }
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
                console.log(this.state.players);
                if (this.state.playersArray.length == 5) {
                  randomPlayer.update({ imposter: true });
                  db.ref("/AmongUS/Game_Settings/").update({
                    game_started: true,
                  });
                } else {
                  Alert.alert("Not enough players to start game!");
                }
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
            this.setState({ players: [] });
            this.setState({ playersArray: [] });
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
          {this.state.playersArray.map((player) => {
            return (
              <View key={player.color}>
                <Text
                  key={player.color}
                  style={{ fontSize: 18 }}
                >{`Name:   ${player.name}\nColor:  ${player.color}\nImposter?: ${player.imposter}`}</Text>
                <Image
                  style={styles.image}
                  source={colorsPath[player.deviceID][player.dead]}
                ></Image>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

class PlayerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      deviceID: "",
      gameStarted: false,
      color: "black",
      imposter: false,
      myTasks: [],
      currentTask: 0,
      dead: false,
      joinedGame: false,
      totalDoneTasks: 0,
      sabotage: "",
      meeting: "",
    };
  }

  render() {
    if (!this.state.joinedGame) {
      return (
        <View style={styles.container}>
          <Text>Your name: </Text>
          <TextInput
            onChangeText={(n) => this.setState({ name: n })}
            style={styles.TextInput}
          ></TextInput>
          <Text>Device id: </Text>
          <TextInput
            keyboardType="phone-pad"
            onChangeText={(id) => this.setState({ deviceID: id })}
            style={styles.TextInput}
          ></TextInput>
          <Button onPress={this.addPlayer.bind(this)} title="Join game" />
        </View>
      );
    } else {
      if (!this.state.gameStarted) {
        return (
          <View style={styles.container}>
            <Image
              style={styles.image}
              source={colorsPath[this.state.deviceID][this.state.dead]}
            ></Image>
            <Text style={{ fontSize: 18 }}>
              Please wait. the game has not started.
            </Text>
          </View>
        );
      } else {
        return (
          <View style={styles.container}>
            <Text>Total tasks bar: </Text>
            <ProgressBar
              borderRadius={4}
              color={this.state.color}
              animated={true}
              progress={this.state.totalDoneTasks / 20}
              width={windowWidth * 0.5}
            />
            <Image
              style={styles.image}
              source={colorsPath[this.state.deviceID][this.state.dead]}
            ></Image>
            {this.loadCenter()}
            {this.loadTask()}
          </View>
        );
      }
    }
  }

  loadTask() {
    if (this.state.currentTask > 0) {
      return <Text>loading task: {this.state.currentTask}</Text>;
    }
  }

  addPlayer() {
    if (this.state.deviceID != -1 && this.state.name != "") {
      let deviceID = this.state.deviceID;
      let color = "";
      if (deviceID == 1) {
        color = "red";
      }
      if (deviceID == 2) {
        color = "blue";
      }
      if (deviceID == 3) {
        color = "green";
      }
      if (deviceID == 4) {
        color = "orange";
      }
      if (deviceID == 5) {
        color = "black";
      }

      db.ref("AmongUS/currentPlayers/" + this.state.deviceID).update({
        color: color,
        deviceID: this.state.deviceID,
        name: this.state.name,
        imposter: false,
        dead: false,
        current_task: "",
      });
      this.setState({ color: color });
      this.setState({ joinedGame: true });
      this.joinLobby();
    }
  }

  joinLobby() {
    // waiting for game to start
    gameStarted.on("value", (snapshot) => {
      if (snapshot.val()) {
        // true == game has started
        // when will i die :(
        db.ref("AmongUS/currentPlayers/" + this.state.deviceID + "/dead").on(
          "value",
          (snapshot) => {
            this.setState({ dead: snapshot.val() });
          }
        );
        // if something changed
        db.ref("AmongUS/current_game_settings/").on("value", (snapshot) => {
          this.setState({ totalDoneTasks: snapshot.val().num_Tasks });
          this.setState({ sabotage: snapshot.val().sabotage });
          this.setState({ meeting: snapshot.val().meeting });
        });

        this.setState({ gameStarted: true });
        // check if i'm imposter
        db.ref(
          "AmongUS/currentPlayers/" + this.state.deviceID + "/imposter"
        ).once("value", (snapshot) => {
          // if i'm imposter
          if (snapshot.val()) {
            //Alert("you are the imposter")
            // update status
            this.setState({ imposter: true });
            // show imposter sabotage screen
            // TODO
          } else {
            //Alert("you are not the imposter")
            // load my task
            db.ref(
              "AmongUS/currentPlayers/" +
                this.state.deviceID +
                "/tasks_group_id"
            ).once("value", (snapshot) => {
              this.setState({ myTasks: globalTasks[snapshot.val()] });
            });
            // Waiting for scanner
            db.ref(
              "AmongUS/currentPlayers/" + this.state.deviceID + "/current_task"
            ).on("value", (snapshot) => {
              if (snapshot.val() != "") {
                // load the task
                // console.log("loading task with id:" + this.state.myTasks[snapshot.val()].Task_id);
                // this.setState({ currentTask: this.state.myTasks[snapshot.val()].Task_id });
              }
            });
            // waiting for task bar changes
            // TODO
          }
        });
      }
    });
  }

  loadCenter() {
    if (this.state.gameStarted) {
      if (!this.state.dead) {
        // if there's a meeting
        if (this.state.meeting != "") {
          return (
            <Text style={{ fontSize: 18 }}>
              There's a meeting called by: {this.state.meeting}. Go to the
              meeting place.
            </Text>
          );
        } else {
          if (this.state.imposter) {
            return (
              <Text>You are the IMPOSTER</Text>
              // load sabotage menu
            );
          } else {
            // check if there's a sabotage don't load tasks
            if (this.state.sabotage != "") {
              return (
                <Text style={{ fontSize: 18 }}>
                  There's sabotage: {this.state.sabotage}
                </Text>
              );
            } else {
              let tasks = "";
              Object.keys(this.state.myTasks).forEach(
                (key) =>
                  (tasks +=
                    "You have task in: " +
                    this.state.myTasks[key].Task_location +
                    "\n")
              );
              return (
                (<Text>I"M NOT IMPOSTER, Loading tasks here</Text>),
                (<Text>{tasks}</Text>)
              );
            }
          }
        }
      } else {
        return <Text>u r dead</Text>;
      }
    }
  }
}

function App() {
  const [imposter, isImposter] = useState(false);

  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Player Page" component={PlayerPage} /> */}
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
