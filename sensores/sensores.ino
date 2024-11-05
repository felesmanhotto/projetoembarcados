#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>

// Definições de WiFi
#ifndef STASSID
#define STASSID "FelipeS22"
#define STAPSK "12341234"
#endif

const char* ssid = STASSID;
const char* password = STAPSK;

const int lm35Pin = A0;
const int motionPin = D2;      // Pino digital para H2-41A (GPIO5)

// Fatores de conversão
const float vRef = 3.3;    // Tensão de referência do ADC (3.3V para Wemos D1 R1)
const int adcMax = 1023;    // Resolução do ADC (10 bits)
const float mvPerC = 10.0;  // Sensibilidade do LM35 (10 mV/°C)

// Inicializa o servidor web na porta 80
ESP8266WebServer server(80);

// Definição do pino do LED (use LED_BUILTIN para o LED interno, geralmente GPIO2 - D4)
const int led = LED_BUILTIN;

// Função que lida com a rota raiz "/"
void handleRoot() {
  digitalWrite(led, HIGH); // Acende o LED
  server.send(200, "text/plain", "hello from esp8266!\r\n"); // Envia a mensagem
  digitalWrite(led, LOW); // Apaga o LED
}

void setup(void) {

  // ----- WI-FI -------

  // Configura o pino do LED
  pinMode(led, OUTPUT);
  digitalWrite(led, LOW);

  // Inicializa a comunicação serial
  Serial.begin(115200);
  Serial.println();
  Serial.println("Iniciando...");

  // Configura o modo WiFi e conecta-se
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.print("Conectando-se a ");
  Serial.println(ssid);

  // Aguarda a conexão
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Conectado a ");
  Serial.println(ssid);
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());

  // Inicia o respondedor MDNS (opcional)
  if (MDNS.begin("esp8266")) { 
    Serial.println("Respondedor MDNS iniciado"); 
  } else {
    Serial.println("Falha ao iniciar o respondedor MDNS");
  }

  // Registra a função handleRoot para a rota "/"
  server.on("/", handleRoot);

  // Inicia o servidor
  server.begin();
  Serial.println("Servidor HTTP iniciado");

  // ----- SENSOR TEMPERATURA ------

  pinMode(lm35Pin, INPUT);

  // ---- SENSOR MOVIMENTO ----

   pinMode(motionPin, INPUT);   // Define o pino do sensor de movimento como entrada
}

#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

void sendTemperature(float temperature) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;
    Serial.println("Tentando enviar temperatura...");
    http.begin(client, "http://192.168.48.148:3000/sensor/temperature");

    http.addHeader("Content-Type", "application/json");

    String json = "{\"temperature\":" + String(temperature) + "}";
    Serial.println("JSON enviado: " + json);
    int httpResponseCode = http.POST(json);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Código de resposta HTTP: " + String(httpResponseCode));
      Serial.println("Resposta do servidor: " + response);
    } else {
      Serial.println("Erro ao enviar temperatura. Código de erro: " + String(httpResponseCode));
    }

    http.end();
  } else {
    Serial.println("Wi-Fi desconectado.");
  }
}

void sendMotion(String motion) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client; // Declaração do objeto WiFiClient
    HTTPClient http;
    http.begin(client, "http://192.168.48.148:3000/sensor/motion"); // Passa o WiFiClient e a URL

    http.addHeader("Content-Type", "application/json");

    String json = "{\"motion\":\"" + motion + "\"}";
    int httpResponseCode = http.POST(json);

    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.println("Erro ao enviar movimento");
    }

    http.end();
  }
}
void loop(void) {

  // ---- WI-FI ----

  server.handleClient(); // Processa as requisições HTTP
  MDNS.update();        // Atualiza o mDNS

  // ---- SENSOR TEMPERATURA ----

  int analogValue = analogRead(lm35Pin); // Lê o valor analógico do LM35
  float voltage = analogValue * vRef / adcMax; // Converte o valor analógico para Volts
  float temperature = voltage / (mvPerC / 1000); // Converte Volts para °C

  Serial.print(temperature);
  Serial.println("ºC");

  sendTemperature(temperature);

  // ---- SENSOR MOVIMENTO ----

  int motionState = digitalRead(motionPin);             // Lê o estado do sensor de movimento
  String motion = (motionState == HIGH) ? "Movimento Detectado" : "Sem Movimento";

  Serial.print("Estado do sensor de movimento: ");
  Serial.println(motion);

  sendMotion(motion);

  delay(2000);
}
