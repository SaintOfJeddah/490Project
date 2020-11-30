import React, { Component } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Button,
  Alert,
  ScrollView,
  Switch,
} from "react-native";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default class Ping extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      routerOn: false,
      cmdText: "Router is down",
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text
          style={{
            color: this.state.routerOn ? "green" : "red",
          }}
        >
          {this.state.routerOn ? "ROUTER UP" : "ROUTER DOWN"}
        </Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 18, margin: 20, fontWeight: "500" }}>
            Router Switch
          </Text>
          <Switch
            disabled={this.state.routerOn}
            style={{ backgroundColor: "#cc0000", borderRadius: 15 }}
            value={this.state.routerOn}
            onValueChange={() => {
              this.setState({ routerOn: !this.state.routerOn });
              setTimeout(() => {
                this.setState({ cmdText: "Connecting to HQ router..." });
              }, 2000);
              setTimeout(() => {
                this.setState({
                  cmdText:
                    this.state.cmdText +
                    "\nPinging 192.168.1.162 with 32 bytes of data",
                });
              }, 4000);
              setTimeout(() => {
                this.setState({
                  cmdText:
                    this.state.cmdText + "\nPinging 192.168.1.162, res: 1",
                });
              }, 6000);
              setTimeout(() => {
                this.setState({
                  cmdText:
                    this.state.cmdText + "\nPinging 192.168.1.162, res: 1",
                });
              }, 7000);
              setTimeout(() => {
                this.setState({
                  cmdText:
                    this.state.cmdText + "\nPinging 192.168.1.162, res: 1",
                });
              }, 8000);
              setTimeout(() => {
                this.setState({
                  cmdText:
                    this.state.cmdText + "\nPinging 192.168.1.162, res: 1",
                });
              }, 9000);
              setTimeout(() => {
                this.setState({
                  cmdText:
                    this.state.cmdText +
                    "\nPing result: Packets sent: 4, Packets Received: 4, Success Rate: 100%",
                });
                // update the db
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

            }, 9000);
            }}
          ></Switch>
        </View>
        <View
          style={{
            backgroundColor: "black",
            width: windowWidth * 0.9,
            height: windowHeight * 0.5,
          }}
        >
          <Text style={{ color: "lime" }}>{this.state.cmdText}</Text>
        </View>
      </View>
    );
  }
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
