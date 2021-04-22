#include <Keypad.h>
#include <LiquidCrystal_PCF8574.h>
#include <Wire.h>

LiquidCrystal_PCF8574 lcd(0x3F);

const byte ROWS = 4;
const byte COLS = 4;
char hexaKeys[ROWS][COLS] = {
  {'1', '2', '3', 'A'},
  {'4', '5', '6', 'B'},
  {'7', '8', '9', 'C'},
  {'*', '0', '#', 'D'}
};
byte rowPins[ROWS] = {9, 8, 7, 6};
byte colPins[COLS] = {5, 4, 3, 2};
Keypad keypad = Keypad( makeKeymap(hexaKeys), rowPins, colPins, ROWS, COLS );

int green = 13;
int red = 11;
int yellow = 12;

const String password = "030899"; // change your password here
const String imposterPassword = "666";
String input_password;

void setup() {
  Wire.begin();
  Wire.beginTransmission(0x3F);
  int error = Wire.endTransmission();
  Serial.begin(9600);
  pinMode(green, OUTPUT);
  pinMode(red, OUTPUT);
  pinMode(yellow, OUTPUT);
  if (error == 0) {
    Serial.println(": LCD found.");
    lcd.begin(16, 2); // initialize the lcd
    lcd.setBacklight(255);
  } else {
    Serial.println(": LCD not found.");
  }
  lcd.begin(16, 2);
  lcd.print("Your Password is : ");

  input_password.reserve(32); // maximum input characters is 33, change if needed
}

void loop() {
  char key = keypad.getKey();
  digitalWrite(yellow, LOW);
  if (key) {
    Serial.println(key);
    if (key == '*') {
      input_password = ""; // clear input password
      lcd.clear();
      lcd.print("password has");
      lcd.setCursor(0, 1);
      lcd.print("been cleared");

      Serial.println("password has been cleared: ");

      digitalWrite(green, LOW);
    }

    else if (key == '#') {
      if (password == input_password) {
        Serial.println("maradona");
        lcd.clear();
        lcd.print("Correct! Pass:");
        lcd.setCursor(0, 1);
        lcd.print("maradona");
        digitalWrite(green, HIGH);
      }
      else if (imposterPassword == input_password) {
        lcd.clear();
        Serial.println("the KeyPad has been Sabotaged , wait 30 seconds");
        lcd.print("task Sabotaged");
        lcd.setCursor(0, 1);
        lcd.print("Wait 30s");
        digitalWrite(yellow, HIGH);
        delay(10000);
        delay(10000);
        delay(10000);
        lcd.clear();
        digitalWrite(yellow, LOW);
      }
      else {
        lcd.clear();

        Serial.print("Wrong password, Wait for 5 seconds.");
        lcd.print("Wrong password.");
        lcd.setCursor(0, 1);
        lcd.print("Wait for 5s");
        digitalWrite(red, HIGH);
        delay(5000);
        digitalWrite(red, LOW);
        lcd.clear();
      }
      input_password = ""; // clear input password
    }
    else {
      lcd.clear();
      lcd.print("Your Password is : ");
      input_password += key; // append new character to input password string
      lcd.setCursor(0, 1);
      lcd.print(input_password);

    }
  }
}
