// joystick 1
int VRx1 = A2;
int VRy1 = A3; 
int SW1 = 13;

// joystick 2
int VRx2 = A0;
int VRy2 = A1;
int SW2 = 12;

// joystick 1
int xPosition1 = 0;
int yPosition1 = 0;
int SW_state1 = 0;
int mapX1 = 0;
int mapY1 = 0;

//joystick 2
int xPosition2 = 0;
int yPosition2 = 0;
int SW_state2 = 0;
int mapX2 = 0;
int mapY2 = 0;

#include <LiquidCrystal.h>
const int rs = 9, en = 8, d4 = 2, d5 = 3, d6 = 4, d7 = 5;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

void setup() {
  Serial.begin(9600); 
  
  pinMode(VRx1, INPUT);
  pinMode(VRy1, INPUT);
  pinMode(SW1, INPUT_PULLUP); 

  pinMode(VRx2, INPUT);
  pinMode(VRy2, INPUT);
  pinMode(SW2, INPUT_PULLUP);

  lcd.begin(16, 2);
  lcd.print("Password is : ");
}

void loop() {
  xPosition1 = analogRead(VRx1);
  yPosition1 = analogRead(VRy1);
  SW_state1 = digitalRead(SW1);
  mapX1 = map(xPosition1, 0, 1023, -512, 512);
  mapY1 = map(yPosition1, 0, 1023, -512, 512);

  xPosition2 = analogRead(VRx2);
  yPosition2 = analogRead(VRy2);
  SW_state2 = digitalRead(SW2);
  mapX2 = map(xPosition2, 0, 1023, -512, 512);
  mapY2 = map(yPosition2, 0, 1023, -512, 512);
   
  if(mapX1==-512 &&  mapY1==-512 && mapX2==512 &&  mapY2==512 ){
    lcd.setCursor(0, 1);
    lcd.print("code");
    delay(1000);
    lcd.clear();
    lcd.print("Password is : ");
    }
    
  Serial.print("X: ");
  Serial.print(mapX1);
  Serial.print(" | Y: ");
  Serial.print(mapY1);
  Serial.print(" | Button: ");
  Serial.println(SW_state1);

  delay(100);
  
}
