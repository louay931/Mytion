/*
 * Mini-centrale "avion" : anémomètre Pitot, altimètre barométrique,
 * centrale inertielle (attitude + démonstration de la dérive), GPS optionnel.
 *
 * Matériel : Arduino Uno/Nano, MPU6050 (I2C 0x68), BMP280 (I2C 0x76),
 *            MPXV7002DP + tube de Pitot sur A0, GPS NEO-6M optionnel (D4/D3).
 * Bibliothèques (gestionnaire de bibliothèques Arduino) :
 *   - "Adafruit BMP280 Library"
 *   - "TinyGPSPlus" (seulement si AVEC_GPS = 1)
 * Le MPU6050 est lu directement par ses registres (pas de bibliothèque).
 *
 * Sortie : une ligne CSV toutes les 100 ms sur le port série (115200 bauds).
 * Copier le moniteur série dans un fichier .csv, puis tracer avec
 * montage/tracer_mesures.py.
 *
 * Commandes série : 'z' = refaire les zéros (Pitot, biais IMU, altitude, dérive).
 */
#include <Wire.h>
#include <Adafruit_BMP280.h>

#define AVEC_GPS 0
#if AVEC_GPS
#include <SoftwareSerial.h>
#include <TinyGPSPlus.h>
SoftwareSerial gpsSerial(4, 3);  // RX, TX
TinyGPSPlus gps;
#endif

const uint8_t MPU_ADDR = 0x68;
const uint8_t PIN_PITOT = A0;
const float VS = 5.0;             // alimentation du MPXV7002DP (V)
const float R_AIR = 287.05;       // J/(kg.K)
const float G = 9.80665;
const float ALPHA = 0.98;         // coefficient du filtre complémentaire
const unsigned long PERIODE_MS = 100;

Adafruit_BMP280 bmp;

float vPitotZero = 2.5;           // tension sans vent (V)
float pRef = 1013.25;             // pression de référence pour l'altitude (hPa)
float gyroBias[3] = {0, 0, 0};    // °/s
float accBias[3] = {0, 0, 0};     // m/s² (après retrait de la gravité sur z)

float roulis = 0, tangage = 0;    // filtre complémentaire (°)
float roulisGyro = 0;             // gyromètre seul : montre la dérive (°)
float vitX = 0, posX = 0;         // double intégration de ax : montre la dérive

unsigned long tPrec, tDebut;

// ---------------------------------------------------------------- MPU6050
void mpuEcrire(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}

// acc en m/s², gyr en °/s (échelles ±2 g et ±250 °/s)
void mpuLire(float acc[3], float gyr[3]) {
  Wire.beginTransmission(MPU_ADDR);
  Wire.write(0x3B);
  Wire.endTransmission(false);
  Wire.requestFrom(MPU_ADDR, (uint8_t)14);
  int16_t brut[7];
  for (int i = 0; i < 7; i++) brut[i] = (Wire.read() << 8) | Wire.read();
  for (int i = 0; i < 3; i++) {
    acc[i] = brut[i] / 16384.0 * G;
    gyr[i] = brut[i + 4] / 131.0;   // brut[3] = température
  }
}

// ---------------------------------------------------------------- Pitot
float lireTensionPitot(int n) {
  long somme = 0;
  for (int i = 0; i < n; i++) somme += analogRead(PIN_PITOT);
  return somme / (float)n * VS / 1023.0;
}

// Datasheet MPXV7002 : Vout = VS * (0.2 * P[kPa] + 0.5)  ->  q en Pa
float pressionDynamique(float v) {
  return (v - vPitotZero) / (0.2 * VS) * 1000.0;
}

// ---------------------------------------------------------------- Zéros
void calibrer() {
  Serial.println(F("# Calibration : ne pas bouger, pas de vent sur la sonde..."));
  vPitotZero = lireTensionPitot(200);
  float a[3], g[3], sa[3] = {0, 0, 0}, sg[3] = {0, 0, 0};
  const int N = 500;
  for (int k = 0; k < N; k++) {
    mpuLire(a, g);
    for (int i = 0; i < 3; i++) { sa[i] += a[i]; sg[i] += g[i]; }
    delay(2);
  }
  for (int i = 0; i < 3; i++) { gyroBias[i] = sg[i] / N; accBias[i] = sa[i] / N; }
  accBias[2] -= G;                 // capteur à plat : z mesure +1 g
  pRef = bmp.readPressure() / 100.0;   // calage "QFE" : altitude 0 au démarrage
  roulis = tangage = roulisGyro = 0;
  vitX = posX = 0;
  tDebut = tPrec = millis();
  Serial.println(F("t_s,q_Pa,rho,v_pitot_ms,p_hPa,alt_m,roulis_deg,tangage_deg,roulis_gyro_deg,ax_ms2,vx_ms,x_m,gps_v_ms"));
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  mpuEcrire(0x6B, 0x00);           // réveil du MPU6050
  mpuEcrire(0x1A, 0x03);           // filtre passe-bas ~44 Hz
  if (!bmp.begin(0x76)) Serial.println(F("# BMP280 introuvable (essayer 0x77)"));
  bmp.setSampling(Adafruit_BMP280::MODE_NORMAL, Adafruit_BMP280::SAMPLING_X2,
                  Adafruit_BMP280::SAMPLING_X16, Adafruit_BMP280::FILTER_X16,
                  Adafruit_BMP280::STANDBY_MS_63);
#if AVEC_GPS
  gpsSerial.begin(9600);
#endif
  delay(500);
  calibrer();
}

void loop() {
#if AVEC_GPS
  while (gpsSerial.available()) gps.encode(gpsSerial.read());
#endif
  if (Serial.available() && Serial.read() == 'z') calibrer();

  unsigned long t = millis();
  if (t - tPrec < PERIODE_MS) return;
  float dt = (t - tPrec) / 1000.0;
  tPrec = t;

  // --- Anémobarométrie
  float pPa = bmp.readPressure();
  float tK = bmp.readTemperature() + 273.15;
  float rho = pPa / (R_AIR * tK);
  float q = pressionDynamique(lireTensionPitot(20));
  float vPitot = q > 0 ? sqrt(2.0 * q / rho) : 0;
  float alt = 44330.8 * (1.0 - pow(pPa / 100.0 / pRef, 0.190263));

  // --- Inertie
  float a[3], g[3];
  mpuLire(a, g);
  for (int i = 0; i < 3; i++) g[i] -= gyroBias[i];
  float roulisAcc = atan2(a[1], a[2]) * 180.0 / PI;
  float tangageAcc = atan2(-a[0], sqrt(a[1] * a[1] + a[2] * a[2])) * 180.0 / PI;
  roulis = ALPHA * (roulis + g[0] * dt) + (1 - ALPHA) * roulisAcc;
  tangage = ALPHA * (tangage + g[1] * dt) + (1 - ALPHA) * tangageAcc;
  roulisGyro += g[0] * dt;

  // Double intégration de l'accélération selon x (valable capteur à plat)
  float ax = a[0] - accBias[0];
  vitX += ax * dt;
  posX += vitX * dt;

  float vGps = -1;
#if AVEC_GPS
  if (gps.speed.isValid()) vGps = gps.speed.mps();
#endif

  Serial.print((t - tDebut) / 1000.0, 2); Serial.print(',');
  Serial.print(q, 1);          Serial.print(',');
  Serial.print(rho, 3);        Serial.print(',');
  Serial.print(vPitot, 2);     Serial.print(',');
  Serial.print(pPa / 100.0, 2); Serial.print(',');
  Serial.print(alt, 2);        Serial.print(',');
  Serial.print(roulis, 2);     Serial.print(',');
  Serial.print(tangage, 2);    Serial.print(',');
  Serial.print(roulisGyro, 2); Serial.print(',');
  Serial.print(ax, 3);         Serial.print(',');
  Serial.print(vitX, 3);       Serial.print(',');
  Serial.print(posX, 3);       Serial.print(',');
  Serial.println(vGps, 2);
}
