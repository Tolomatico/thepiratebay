# 🚤 Boat - Juego de Barcos Multiplayer

Proyecto 3D interactivo con **Three.js** y **TypeScript** + **Socket.io** para multiplayer. Controlás un barco que navega sobre un océano, dispara cañones, combate enemigos y jugás en línea con otros jugadores.

## 🎮 Controles

| Tecla | Acción |
|-------|--------|
| **W** | Acelerar |
| **S** | Retroceder / Frenar |
| **A** | Girar a la izquierda |
| **D** | Girar a la derecha |
| **SPACE** | Disparar cañón frontal |
| **Q** | Disparar cañón izquierdo |
| **E** | Disparar cañón derecho |
| **Mouse** | Rotar cámara (OrbitControls) |

## 🛠️ Tech Stack

- **Three.js** - Rendering 3D
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **Socket.io** - Comunicación en tiempo real
- **GLTF/GLB** - Formato de modelos 3D
- **Howler.js** - Sistema de audio

## 🚀 Instalación y Ejecución

### Servidor
```bash
cd server
npm install
npm run dev
```

### Cliente
```bash
cd client
npm install
npm run dev
```

El servidor corre en `http://localhost:3000` y el cliente en `http://localhost:5173`.

## 📁 Estructura

### Cliente (`client/src/`)
```
client/src/
├── main.ts                 # Game loop y coordinación
├── boat/                   # Clase Boat (movimiento, modelo, armas)
├── ocean/                  # Ocean con olas animadas
├── input/                  # InputManager (controles teclado)
├── model/                  # ModelManager (carga de modelos GLB)
├── rayo/                   # DirectionHelper (flecha direccional)
├── weapon/                 # Sistema de armas
│   ├── FrontCanon.ts       # Cañón frontal
│   ├── SideCanon.ts        # Cañones laterales
│   ├── Projectile.ts       # Proyectiles
│   └── WeaponSystem.ts     # Clase base
├── bots/                   # Enemigos (Enemy, EnemyManager)
├── player-manager/         # Administración de jugadores remotos
├── remote-player/          # Representación visual de otros jugadores
├── network/                # NetworkManager (Socket.io)
├── soundmanager/           # Sonidos (disparos, música)
├── hud/                    # UI (barra de vida, contadores)
├── explosion/              # Efectos de partículas
└── controlls/               # OrbitControls + seguimiento de cámara
```

### Servidor (`server/src/`)
```
server/src/
├── server.ts               # Entry point (express + socket.io)
├── socket-manager/         # Manejo de conexiones
├── player-manager/         # Datos de jugadores
└── game-manager/           # Estado del juego
```

## 🎨 Características

### Gameplay
- 🌊 Olas animadas con fórmula sinusoidal
- 🚤 Barco flota sobre la superficie del agua
- 🔫 Cañón frontal (SPACE), izquierdo (Q) y derecho (E)
- ⚔️ Enemigos que aparecen aleatoriamente
- 💥 Sistema de colisión proyectil-enemigo
- 💥 Efectos de partículas al destruir enemigos

### Multiplayer
- 👥 Conexión via Socket.io
- 👤 Otros jugadores visibles como barcos rojos ("holandés")
- 📡 Sincronización de posición y rotación en tiempo real

### UI y Audio
- 📊 HUD con barra de vida del jugador
- 💀 Barras de vida sobre los enemigos
- 🔊 Sonido de disparos (shoot.mp3)
- 🎵 Música de fondo (music.wav)
- 🎥 Cámara que sigue al barco

### Modelos
- Buque del jugador (buque.glb)
- Enemigos (box rojo)
- Barcos enemigos (holandes.glb)

## 🔌 Comunicación Cliente-Servidor

### Eventos del cliente al servidor
- `playerMove` - Envía posición y rotación del barco

### Eventos del servidor al cliente
- `currentPlayers` - Lista de jugadores conectados al entrar
- `playerJoined` - Notificación de nuevo jugador
- `playerMoved` - Actualización de posición de otro jugador
- `playerDisconnected` - Notificación de desconexión

## 📝 Documentación

Ver [docs/CLASSES.md](docs/CLASSES.md) para detalle de clases y refactorizaciones sugeridas.