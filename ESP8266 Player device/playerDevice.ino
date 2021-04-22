#include "FirebaseESP8266.h"
#include <ESP8266WiFi.h>
#include <SPI.h>
#include <MFRC522.h>


#define FIREBASE_HOST "esp8266-38237.firebaseio.com"
#define FIREBASE_AUTH "tnHcUxC6n2ZpQ6sQ4E6LEsvT5yAiMPHrnnVJP0C7"
#define WIFI_SSID "" //TODO Change
#define WIFI_PASSWORD "" //TODO Change

#define RST_PIN         D1
#define SS_PIN          D2

String Previous_Scanned_Card;
String Next_Scanned_Card;

MFRC522 mfrc522(SS_PIN, RST_PIN);

FirebaseData firebaseData;
FirebaseJson json;

String deviceID = "1"; // TODO change: numbered from 1 to 5 // Change
String color = "RED"; // TODO change: to the color of the device

String path = "/AmongUS/";
bool imposter = false;
bool dead = false;
int buttonPin = D4;
void setup() {
  Serial.begin(115200);
  SPI.begin();      // Init SPI bus
  mfrc522.PCD_Init();   // Init MFRC522
  //mfrc522.PCD_DumpVersionToSerial();  // Show details of PCD - MFRC522 Card Reader details
  Serial.println(F("Scan PICC to see UID, SAK, type, and data blocks..."));
  pinMode(buttonPin, INPUT_PULLUP);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);

  // wait until game is starting
  Serial.print("Waiting for game to start");
  while (true) {
    // if the game has not started don't continue.
    if (Firebase.getBool(firebaseData, path + "Game_Settings/game_started")) {
      // true == game started
      if (firebaseData.boolData()) {
        break;
      } else {
        Serial.print(".");
        delay(300);
      }
    }
  }
  // check if he is imposter
  if (Firebase.getBool(firebaseData, path + "currentPlayers/" + deviceID + "/imposter")) {
    // true == imposter
    if (firebaseData.boolData()) {
      imposter = true;
    }
  }
  Serial.println("\nGame started");
}

void loop() {
  if (!dead) {
    if (!digitalRead(buttonPin)) {
      if (Firebase.setString(firebaseData, path + "current_game_settings/meeting", color)) {
      }
    }
    Next_Scanned_Card = printDec(mfrc522.uid.uidByte, mfrc522.uid.size);
    // read card
    //MFRC522::PICC_Type piccType = mfrc522.PICC_GetType(mfrc522.uid.sak);
    if (Previous_Scanned_Card != Next_Scanned_Card) {
      // am i crewmate or imposter
      // if crew mate when there's a scan from the rfid add the number to the current task
      // if imposter kill the scanned player
      if (imposter) {
        Serial.println("Imposter scanned the player: ");
        Serial.println(Next_Scanned_Card);
        // set that player status to dead.
        if (Next_Scanned_Card == "1213137153") { // card for player 2
          if (Firebase.setBool(firebaseData, path + "currentPlayers/2/dead", true)) {
            Serial.println("he is dead");
          } else {
            Serial.println("err");
          }
        } else if (Next_Scanned_Card == "249246166162") { // card for player 3
          if (Firebase.setBool(firebaseData, path + "currentPlayers/3/dead", true)) {
            Serial.println("he is dead");
          } else {
            Serial.println("err");
          }
        } else if (Next_Scanned_Card == "89138207162") { // card for player 4
          if (Firebase.setBool(firebaseData, path + "currentPlayers/4/dead", true)) {
            Serial.println("he is dead");
          } else {
            Serial.println("err");
          }
        }
        else if (Next_Scanned_Card == "115191853") { // card for player 5
          if (Firebase.setBool(firebaseData, path + "currentPlayers/5/dead", true)) {
            Serial.println("he is dead");
          } else {
            Serial.println("err");
          }
        }
      } else {
        Serial.println("crewmate scanned the task: ");
        Serial.println(Next_Scanned_Card);
        if (Firebase.setString(firebaseData, path + "currentPlayers/" + deviceID + "/current_task", Next_Scanned_Card)) {
          Serial.println("task added");
        } else {
          Serial.println("err");
        }
      }
    }
    Previous_Scanned_Card = Next_Scanned_Card;
    // im i dead?
    if (Firebase.getBool(firebaseData, path + "currentPlayers/" + deviceID + "/dead")) {
      if (firebaseData.boolData()) {
        Serial.println("You died ;)");
        dead = true;
        // add light here maybe?
      }
    }

    // Look for new cards
    if ( ! mfrc522.PICC_IsNewCardPresent())
      return;

    // Verify if the NUID has been readed
    if ( ! mfrc522.PICC_ReadCardSerial())
      return;
  }
}

String printDec(byte * buffer, byte bufferSize) {
  String key;
  for (byte i = 0; i < bufferSize; i++) {
    key += buffer[i];
  }
  return key;
}