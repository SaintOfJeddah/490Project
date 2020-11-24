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
import ProgressBar from "react-native-progress/Bar";
import * as firebase from "firebase";
import { color } from "react-native-reanimated";
import DialogInput from 'react-native-dialog-input';

// change make one task for sabotage.
let sabotageTasks = [HoldButton, KeyPad];

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

const db = firebase.database();

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
    this.state = {
      admin_exists: false,
    };
    db.ref("AmongUS/Game_Settings/admin_exists").on("value", (snapshot) => {
      this.setState({ admin_exists: snapshot.val() });
    });
  }
  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          disabled={!this.state.admin_exists}
          onPress={() => this.props.navigation.navigate("Player Page")}
          style={[
            styles.button,
            {
              backgroundColor: this.state.admin_exists
                ? "transparent"
                : "silver",
            },
          ]}
        >
          <Text style={[{ fontSize: 18 }, { color: "black" }]}>Player</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={this.state.admin_exists}
          onPress={() => {
            db.ref("AmongUS/Game_Settings/").update({ admin_exists: true });
            this.props.navigation.navigate("Admin Page");
          }}
          style={[
            styles.button,
            {
              backgroundColor: this.state.admin_exists
                ? "silver"
                : "transparent",
            },
          ]}
        >
          <Text
            style={[
              { fontSize: 18 },
              {
                color: "black",
              },
            ]}
          >
            Admin
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

// __________________________________________________________________________ START ADMIN PAGE __________________________________________________________________________

var playersRef = db.ref("AmongUS/currentPlayers/");
var gameStarted = db.ref("AmongUS/Game_Settings/game_started");
var adminExists = db.ref("AmongUS/Game_Settings/admin_exists");

class AdminPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      totalDoneTasks: 0,
      sabotage: "",
      meeting: "",
      startButton: [],
      playersArray: [],
      didGameStarted: false,
    };

    // read the game status only once
    gameStarted.on("value", (snapshot) => {
      this.setState({ didGameStarted: snapshot.val() });
      // if game did start, start waiting for tasks update
      if (snapshot.val()) {
        db.ref("AmongUS/current_game_settings/").on("value", (snapshot) => {
          this.setState({ totalDoneTasks: snapshot.val().num_Tasks });
          this.setState({ sabotage: snapshot.val().sabotage });
          this.setState({ meeting: snapshot.val().meeting });
        });
      }
    });

    // every time changes happens update the players array
    playersRef.on("value", (snapshot) => {
      let tempPlayers = [];
      if (snapshot.val() != null) {
        Object.keys(snapshot.val()).forEach((key) => {
          tempPlayers.push(snapshot.val()[key]);
        });
        this.setState({ playersArray: tempPlayers });
      }
    });
  }
  getResetButton() {
    return (
      <TouchableOpacity
        onPress={() => {
          playersRef.remove();
          db.ref("/AmongUS/Game_Settings/").update({
            game_started: false,
            admin_exists: false,
          });

          db.ref("AmongUS/currentPlayers").remove();
          this.setState({ playersArray: [] });
          this.props.navigation.navigate("Home");
        }}
        style={[styles.button, { marginBottom: 30 }]}
      >
        <Text>Reset Game</Text>
      </TouchableOpacity>
    );
  }

  startTheGame() {
    var imposterID = 1 + Math.floor(Math.random() * 5);
    db.ref(`AmongUS/currentPlayers/` + imposterID).update({ imposter: true });
    // Give other players their group id
    var taskGroupID = [1, 2, 3, 4];
    for (let index = 1; index <= 5; index++) {
      // skipping the imposter
      if (index == imposterID) {
        continue;
      }
      // taking a task id randomly from the array
      var groupID = taskGroupID[Math.floor(Math.random() * taskGroupID.length)]; // from 0 to the size of the array
      // removing the number from array
      taskGroupID.splice(taskGroupID.indexOf(groupID), 1);

      // setting the group id to the player
      db.ref("AmongUS/currentPlayers/" + index).update({
        tasks_group_id: groupID,
      });
    }

    db.ref("AmongUS/current_game_settings/").update({
      meeting: "",
      sabotage: "",
      num_Tasks: 0,
    });
    db.ref("/AmongUS/Game_Settings/").update({
      game_started: true,
    });
  }

  getStartButton() {
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.state.playersArray.length == 5) {
            this.startTheGame();
          } else {
            Alert.alert("Not enough players to start game!");
          }
        }}
        style={styles.button}
      >
        <Text>Start Game</Text>
      </TouchableOpacity>
    );
  }

  getButtons() {
    if (!this.state.didGameStarted) {
      return this.getStartButton();
    } else {
      return this.getResetButton();
    }
  }

  meetingAlert() {
    {
      if (this.state.meeting != "") {
        return (
          <TouchableOpacity
            onPress={() => {
              db.ref("AmongUS/current_game_settings/").update({
                meeting: "",
              });
            }}
            style={styles.bigButton}
          >
            <Text style={{ color: "red", fontSize: 18 }}>
              Remove meeting from {this.state.meeting}
            </Text>
          </TouchableOpacity>
        );
      }
    }
  }
  sabotageAlert() {
    {
      if (this.state.sabotage) {
        return (
          <Text style={{ color: "red", fontSize: 18 }}>
            There's sabotage task in progress
          </Text>
        );
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.getButtons()}
        {this.meetingAlert()}
        {this.sabotageAlert()}
        <Text>Total tasks bar: </Text>
            <ProgressBar
              borderRadius={4}
              color={'black'}
              animated={true}
              progress={this.state.totalDoneTasks / 20}
              width={windowWidth * 0.5}
           />
        <ScrollView
          contentContainerStyle={{
            width: windowWidth,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {this.state.playersArray.map((player) => {
            return (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "center",
                  alignSelf: "center",
                }}
                key={player.deviceID}
              >
                <Image
                  style={styles.image}
                  source={colorsPath[player.deviceID][player.dead]}
                ></Image>
                <Text key={player.color} style={{ fontSize: 18 }}>
                  {`${player.name}\n with device id: ${player.deviceID}\n`}{" "}
                  {player.imposter ? (
                    <Text style={{ color: "red" }}>The imposter</Text>
                  ) : (
                    ""
                  )}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }
}

// __________________________________________________________________________ END ADMIN PAGE __________________________________________________________________________

// __________________________________________________________________________ START PLAYER PAGE __________________________________________________________________________

let globalTasks = [];
db.ref("AmongUS/tasks_rfid").once("value", (snapshot) => {
  globalTasks = snapshot.val();
});

var gameStarted = db.ref("AmongUS/Game_Settings/game_started");

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
      isSabotage: false,
      meeting: "",
    };

    db.ref("AmongUS/Game_Settings/game_started").once("value", (snapshot) => {
      if (snapshot.val()) {
        Alert.alert("The game has already started!");
        this.props.navigation.navigate("Home");
      }
    });
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
    // god bless apple.
    if (this.state.currentTask > 0) {

      if (this.state.currentTask==1){ // [Physical] Guess the tone
          return <DialogInput isDialogVisible={true}
            title={"Guess the tone"}
            message={"What was the game? (in english)"}
            hintInput ={"The game"}
            submitInput={ (inputText) => {
              if (inputText.toLowerCase()=="mario"){
                this.props.route.params.db.ref("AmongUS/current_game_settings/num_Tasks").once("value", (snapshot) => {
                  var count = snapshot.val();
                  count++;
                  this.props.route.params.db.ref("AmongUS/current_game_settings/").update({num_Tasks:count});
                  this.props.navigation.goBack();
                  });              
              }
              console.log(inputText);
              this.showDialog(false);
            }
          }
            closeDialog={ () => {this.isDialogVisible(false)}}>
          </DialogInput>
      }else if (this.state.currentTask==2){ // [Physical] Decrypt the code

      }else if (this.state.currentTask==3){ // [Physical] Joystick

      }else if (this.state.currentTask==4){ // KeyPad
        this.props.navigation.navigate("Keypad task", {db: db});
      }else if (this.state.currentTask==5){ // Hold button
        this.props.navigation.navigate("Node task", {db: db});
      }else {
        this.setState({currentTask: 0});
      }
      this.setState({currentTask: 0});
      //return <Text>loading task: {this.state.currentTask}</Text>;
      //this.setState({currentTask: 0});
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
        current_task: 0,
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
          this.setState({ isSabotage: snapshot.val().sabotage });
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
          } else {
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
              if (snapshot.val()!=0) {
                // load the task
                console.log("loading task with id:" + this.state.myTasks[snapshot.val()].Task_id);
                this.setState({ currentTask: this.state.myTasks[snapshot.val()].Task_id });
              }
            });
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
              <View>
                <Text>You are the IMPOSTER</Text>,
                <TouchableOpacity
                style={[
                  styles.button
                ]}
                >
                <Text>Sabotage on them</Text>
              </TouchableOpacity>
            </View>
            );
          } else {
            if (this.state.isSabotage) {
              // this.props.navigation.navigate("Node Sabotage", {db: db});
              return (
                <Text style={{ fontSize: 18 }}>
                  There's sabotage
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
        return <Text>You are dead :)</Text>;
      }
    }
  }
}
// __________________________________________________________________________ END PLAYER PAGE __________________________________________________________________________

function App() {
  const Stack = createStackNavigator();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerLeft: null, gestureEnabled: false }}
          name="Home"
          component={Home}
        />
        <Stack.Screen name="Player Page" component={PlayerPage} />
        <Stack.Screen
          options={{ headerLeft: null, gestureEnabled: false }}
          name="Admin Page"
          component={AdminPage}
        />
        <Stack.Screen
          options={{ headerLeft: null, gestureEnabled: false }}
          name="Node task"
          component={HoldButton}
        />
        <Stack.Screen
          options={{ headerLeft: null, gestureEnabled: false }}
          name="Keypad task"
          component={KeyPad}
        />
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

  bigButton: {
    marginTop: 10,
    width: windowWidth * 0.8,
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

  imageAdminPage: {
    width: 96,
    height: 96,
  },
});

export default App;
