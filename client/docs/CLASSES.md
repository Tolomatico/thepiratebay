# Documentación de Clases - Cliente

## 1. Game (main.ts)
**Utilidad**: Clase principal que orquesta todo el juego. Es el punto de entrada y el loop de actualización.

**Responsabilidades**:
- Inicializar Three.js (scene, camera, renderer)
- Configurar iluminación (DirectionalLight, AmbientLight, HemisphereLight)
- Inicializar todos los managers (Network, Player, Enemy, Sound, HUD)
- Coordinar el loop de juego (update de todos los componentes cada frame)
- Emitir posición del jugador al servidor periódicamente
- Manejar evento resize de la ventana

**Propiedades principales**:
```typescript
scene          // Escena 3D de Three.js
camera         // Cámara perspectiva
renderer       // WebGL renderer
boat           // El barco del jugador
ocean          // El océano con olas
controls       // OrbitControls + seguimiento
enemyManager   // Gestor de enemigos
hud            // Interfaz de usuario
soundManager   // Audio del juego
networkManager // Conexión Socket.io
playerManager  // Jugadores remotos
clock          // THREE.Clock para delta time
```

**Flujo del game loop**:
1. Emitir posición/rotación al servidor
2. Actualizar Boat (movimiento, armas, física)
3. Actualizar Ocean (animación de olas)
4. Actualizar Controlls (cámara sigue al barco)
5. Actualizar EnemyManager (IA, colisiones, daño)
6. Actualizar HUD (mostrar vida, enemigos)
7. Renderizar escena

---

## 2. Boat (boat/Boat.ts)
**Utilidad**: Representa al jugador. Maneja el modelo 3D, movimiento, armas y salud.

**Responsabilidades**:
- Cargar modelo GLB del buque (buque.glb)
- Movimiento con física (aceleración, fricción, rotación)
- Sistema de tres cañones (frontal, izquierdo, derecho)
- Flotar sobre las olas del océano
- Recibir daño de enemigos
- Sincronizar posición con el servidor

**Propiedades**:
```typescript
container      // THREE.Group - objeto principal que se mueve
visualBox      // THREE.Group - contiene el modelo 3D
frontCanon     // FrontCanon - cañón frontal (SPACE)
leftCanon      // SideCanon - cañón izquierdo (Q)
rightCanon     // SideCanon - cañón derecho (E)
health         // Salud actual (100)
maxHealth      // Salud máxima (100)
velocity       // Velocidad actual del barco
speed          // Velocidad lineal
maxSpeed       // Velocidad máxima
offsetY        // Offset vertical para flotar sobre olas
```

**Parámetros de movimiento**:
- `acceleration = 0.0005` - Aceleración al presionar W
- `maxSpeed = 0.01` - Velocidad máxima hacia adelante
- `maxReverseSpeed = 0.005` - Velocidad máxima hacia atrás
- `rotationSpeed = 0.015` - Velocidad de giro

**Métodos importantes**:
```typescript
loadModel()                    // Carga y escala el GLB, calcula offsetY
update(input, time, delta)     // Actualiza movimiento, física, armas
getObject3D()                  // Retorna el container para la cámara
getActiveProjectiles()         // Retorna todos los proyectiles activos
getHitbox()                    // Retorna el tamaño para colisiones
takeDamage(amount)             // Reduce la salud
```

**Física de movimiento**:
- W: acelera si va hacia adelante, frena si va hacia atrás
- S: frena si va hacia adelante, acelera hacia atrás si va hacia atrás
- A/D: gira a izquierda/derecha con factor de giro basado en velocidad
- El barco se mueve en la dirección de su rotación (sin(rotation.y), cos(rotation.y))
- Fricción del 0.99 aplicada cada frame

---

## 3. Ocean (ocean/Ocean.ts)
**Utilidad**: Genera el océano con olas animadas y provee la altura de ola en cualquier punto del espacio.

**Responsabilidades**:
- Crear mesh del océano (PlaneGeometry 500x500 con 200x200 segmentos)
- Animar los vértices del mesh cada frame
- Calcular altura de ola para posicionar el barco y enemigos

**Parámetros de olas** (públicos, configurables):
```typescript
waveHeight = 0.3   // Altura máxima de las olas
waveSpeed = 0.0003 // Velocidad de animación
waveLength = 0.15  // Longitud de onda (qué tan "anchas" son las olas)
```

**Fórmula de ola** (privada, usada en ambos métodos):
```typescript
sin(x * waveLength + time * waveSpeed) * waveHeight +
sin(z * waveLength * 1.5 + time * waveSpeed * 0.6) * waveHeight
```
Esta fórmula combina dos ondas sinusoidales en diferentes direcciones para crear un patrón más realista.

**Métodos**:
```typescript
calculateWave(x, z, time)  // Fórmula privada unificada
getWaveHeight(x, z, time) // Altura de ola en coordenadas x,z
update(time)              // Anima los vértices del mesh
```

---

## 4. InputManager (input/InputManager.ts)
**Utilidad**: Captura y gestiona la entrada del teclado.

**Responsabilidades**:
- Escuchar eventos keydown y keyup
- Mantener lista de teclas actualmente presionadas
- Evitar duplicados en la lista

**Teclas soportadas**:
| Tecla | Acción |
|-------|--------|
| W | Acelerar |
| S | Retroceder/Frenar |
| A | Girar izquierda |
| D | Girar derecha |
| SPACE | Disparar frontal |
| Q | Disparar izquierdo |
| E | Disparar derecho |

**Propiedades**:
```typescript
keysPressed: string[]  // Array con las teclas actualmente presionadas
```

**Lógica importante**:
- En `isKeyPressed`: solo agrega si no existe (evita duplicados)
- En `isKeyReleased`: usa `filter` en lugar de `pop` (el pop remove el último, no el correcto)

---

## 5. ModelManager (model/ModelManager.ts)
**Utilidad**: Carga y cachea modelos GLB/GLTF para evitar cargas repetitivas.

**Responsabilidades**:
- Cargar modelos via GLTFLoader
- Almacenar en cache los modelos cargados
- Retornar clones de los modelos cacheados

**Métodos**:
```typescript
load(path: string): Promise<THREE.Object3D>
```
- Si el modelo ya está en cache, retorna un clone inmediato
- Si no, carga desde el archivo, lo cachea, y retorna un clone

**Modelos usados**:
- `/models/buque.glb` - El barco del jugador
- `/models/holandes.glb` - Barcos de jugadores remotos

---

## 6. Controlls (controlls/Controlls.ts)
**Utilidad**: Maneja la cámara. Combina OrbitControls (rotación con mouse) con seguimiento automático del barco.

**Responsabilidades**:
- Inicializar OrbitControls con configuración de jogo
- Seguir al barco cuando este se mueve
- Permitir rotación libre con el mouse

**Configuración de OrbitControls**:
```typescript
enableDamping = true        // Suavizado de movimiento
dampingFactor = 0.05       // Factor de suavizado
screenSpacePanning = false // Paning en plano horizontal
minDistance = 1            // Distancia mínima
maxDistance = 100          // Distancia máxima
maxPolarAngle = PI/2.1     // No permitir cámara bajo el agua
minPolarAngle = PI/6       // No permitir cámara muy arriba
```

**Propiedades**:
```typescript
camera        // Referencia a la cámara
target        // Objeto a seguir (el boat)
lastTargetPos // Posición anterior del target (para calcular delta)
```

**Lógica de seguimiento**:
- Cada frame calcula el delta entre posición actual y anterior del target
- Agrega ese delta a la posición de la cámara
- Actualiza el target de OrbitControls para que rote alrededor del barco

---

## 7. WeaponSystem (weapon/WeaponSystem.ts)
**Utilidad**: Clase abstracta base para todos los sistemas de armas.

**Responsabilidades**:
- Manejar cooldown (tiempo entre disparos)
- Administrar proyectiles activos
- Actualizar proyectiles cada frame (movimiento, lifetime)

**Propiedades**:
```typescript
fireRate     // Tiempo entre disparos en ms
cooldown     // Tiempo restante para poder disparar (ms)
projectiles  // Array de proyectiles activos
origin       // Objeto del cual disparan los proyectiles (el boat)
scene        // Escena 3D para agregar proyectiles
```

**Flujo de actualización**:
```typescript
update(delta) {
  this.cooldown -= delta;  // Reducir cooldown
  this.projectiles = this.projectiles.filter(p => {
    p.update(delta);        // Mover cada proyectil
    return p.isAlive();     // Mantener solo los vivos
  });
}
```

**Métodos**:
```typescript
canShoot()           // Retorna true si cooldown <= 0
resetCooldown()      // Reinicia cooldown a fireRate
getProjectiles()     // Retorna array de proyectiles
shoot()              // Abstracto - implementado por cada cañón
```

---

## 8. FrontCanon (weapon/FrontCanon.ts)
**Utilidad**: Cañón que dispara hacia adelante (en la dirección del barco).

**Extiende**: WeaponSystem

**Configuración**:
```typescript
fireRate = 1000  // 1 segundo entre disparos
```

**Lógica de shoot()**:
1. Verifica `canShoot()`
2. Obtiene posición mundial del origin (barco)
3. Obtiene dirección mundial hacia adelante (eje Z del barco)
4. Crea Projectile con posición y dirección
5. Agrega al array de proyectiles
6. Reinicia cooldown

---

## 9. SideCanon (weapon/SideCanon.ts)
**Utilidad**: Cañón que dispara hacia los lados (izquierda o derecha del barco).

**Extiende**: WeaponSystem

**Constructor**:
```typescript
constructor(scene, origin, leftOrRight, damage, quantity?)
- leftOrRight: "left" | "right" - Indica qué lado
- damage: número - Daño que inflingen los proyectiles
- quantity: número (opcional) - Cuántos proyectiles dispara (default 2)
```

**Configuración**:
```typescript
fireRate = 1000  // 1 segundo entre disparos
quantity = 2     // Dispara 2 proyectiles en paralelo
```

**Lógica de shoot()**:
- Dispara múltiples proyectiles (quantity)
- Calcula posición con offset en eje forward para distribuirlos
- Usa `getWorldDirection` con matriz del origin para obtener dirección lateral
- left: dirección positiva del eje X del barco
- right: dirección negativa del eje X del barco

---

## 10. Projectile (weapon/Projectile.ts)
**Utilidad**: Proyectil disparado por los cañones. Viaja en línea recta y causa daño.

**Propiedades**:
```typescript
mesh       // THREE.Mesh - esfera negra visible
velocity   // THREE.Vector3 - velocidad y dirección
lifetime = 3000  // Tiempo de vida en ms
age = 0          // Tiempo transcurrido desde creación
damage = 0       // Daño que inflige al impactar
```

**Velocidad**:
```typescript
this.velocity = direction.clone().normalize().multiplyScalar(0.05);
```
0.05 unidades por frame (ajustable según necesidad)

**Métodos**:
```typescript
update(delta) {
  this.mesh.position.add(this.velocity);  // Mover
  this.age += delta;                      // Actualizar edad
  if (this.age > this.lifetime) {
    this.destroy();                       // Destruir si expiró
  }
}
isAlive()     // Retorna true si age < lifetime
getPosition() // Retorna posición actual (para colisiones)
destroy()     // Remueve el mesh de la escena
```

---

## 11. EnemyManager (bots/EnemyManager.ts)
**Utilidad**: Administra la creación, actualización y destrucción de enemigos.

**Responsabilidades**:
- Spawnear enemigos en posiciones aleatorias
- Actualizar todos los enemigos (movimiento, física de olas)
- Detectar colisiones entre proyectiles y enemigos
- Manejar daño al jugador
- Gestionar eliminación de enemigos muertos

**Constructor**:
```typescript
constructor(scene, ocean, onShoot?)
- scene: escena 3D
- ocean: referencia al ocean (para altura de olas)
- onShoot: callback opcional cuando se dispara
```

**Métodos**:
```typescript
spawnEnemies(count)      // Crea 'count' enemigos en posiciones aleatorias
update(time, projectiles, delta, playerPos, playerVel, playerHitbox, onDamage)
removeEnemy()           // Elimina enemigos muertos de la escena y array
getEnemies()            // Retorna array de enemigos activos
```

**Lógica de colisiones**:
- Por cada proyectil, verificar distancia a cada enemigo
- Si distancia < 1.2 (radio de colisión), causar daño
- El proyectil se destruye al impactar

---

## 12. Enemy (bots/Enemy.ts)
**Utilidad**: Enemigo individual que navega y ataca al jugador.

**Apariencia**: Box rojo (BoxGeometry 1, 0.5, 2) con MeshStandardMaterial color 0xff3333

**Propiedades**:
```typescript
container    // THREE.Group - objeto principal
health = 100 // Salud inicial
damage = 10   // Daño que causa al jugador al chocar
speed = 0.005 // Velocidad de movimiento hacia el jugador
```

**Física de olas**: El enemigo flota sobre las olas usando `ocean.getWaveHeight()`

**Métodos**:
```typescript
update(time)                         // Actualiza posición Y según ola
getPosition()                        // Retorna posición del enemy
takeDamage(amount)                   // Reduce salud
isDead()                             // Retorna true si health <= 0
getHealthRatio()                     // Retorna health/100 para la barra
destroy()                            // Remueve de la escena
```

**IA simple**: Se mueve gradualmente hacia la posición del jugador.

---

## 13. NetworkManager (network/NetworkManager.ts)
**Utilidad**: Maneja la conexión con el servidor via Socket.io.

**Responsabilidades**:
- Conectar al servidor
- Escuchar eventos del servidor
- Emitir eventos al servidor

**Servidor**: Se conecta a `http://localhost:3000`

**Eventos recibidos**:
```typescript
onCurrentPlayers(callback)     // Lista de jugadores ya conectados
onPlayerJoined(callback)       // Nuevo jugador se unió
onPlayerMoved(callback)        // Jugador cambió posición/rotación
onPlayerDisconnected(callback)  // Jugador se desconectó
```

**Eventos emitidos**:
```typescript
emitMove(data)  // Envía { position: {x,y,z}, rotation: {y} }
```

**Propiedades**:
```typescript
socket  // Socket.io Socket - conexión activa
```

---

## 14. PlayerManager (player-manager/PlayerManager.ts)
**Utilidad**: Administra los jugadores remotos (otros clientes conectados).

**Responsabilidades**:
- Crear visualizaciones de nuevos jugadores
- Actualizar posición/rotación de jugadores existentes
- Eliminar jugadores que se desconectan

**Propiedades**:
```typescript
players: Map<string, RemotePlayer>  // Mapa de ID -> instancia
```

**Métodos**:
```typescript
addPlayer(id)           // Crea RemotePlayer si no existe
removePlayer(id)       // Destruye y elimina del mapa
updatePlayer(data)     // Actualiza posición/rotación
getPlayer(id)          // Retorna RemotePlayer por ID
```

---

## 15. RemotePlayer (remote-player/RemotePlayer.ts)
**Utilidad**: Representación visual de otro jugador en el juego.

**Modelo**: Carga `/models/holandes.glb` (barco荷兰és)

**Propiedades**:
```typescript
container  // THREE.Group - objeto principal
model      // THREE.Object3D - modelo GLB cargado
id         // string - ID del jugador en el servidor
```

**Escalado**: Escala el modelo a tamaño 50x50x50 para que coincida con el juego

**Actualización**:
```typescript
updatePosition(position, rotation) {
  this.container.position.set(position.x, position.y, position.z);
  this.container.rotation.y = rotation.y - Math.PI/2;
}
```
Resta PI/2 a la rotación porque el modelo está orientado diferentemente.

**Métodos**:
```typescript
getId()     // Retorna el ID del jugador
destroy()   // Remueve el modelo de la escena
```

---

## 16. SoundManager (soundmanager/SoundManager.ts)
**Utilidad**: Gestiona todos los sonidos del juego usando Howler.js.

**Sonidos**:
```typescript
shootSound  // /sounds/shoot.mp3 - sonido de disparo
music       // /sounds/music.wav - música de fondo (loop)
```

**Configuración**:
```typescript
shootSound volume = 0.15
music volume = 0.1, loop = true
```

**Métodos**:
```typescript
playShootSound()  // Reproduce sonido de disparo
playMusic()       // Inicia la música de fondo
```

---

## 17. HUD (hud/Hud.ts)
**Utilidad**: Muestra la interfaz de usuario en pantalla (HTML sobre el canvas).

**Elementos UI**:
1. **Texto de estado** (esquina superior izquierda):
   - Vida del jugador
   - Cantidad de enemigos

2. **Barra de vida del jugador** (centro-abajo):
   - Contenedor con borde blanco
   - Barra verde (roja si vida < 30%)
   - Texto con valores numéricos y porcentaje

3. **Barras de vida de enemigos** (sobre cada enemigo):
   - Aparecen solo si el enemigo está en pantalla
   - Se posicionan proyectando coordenadas 3D a 2D
   - Ancho proporcional a la salud restante

**Propiedades**:
```typescript
healthEl           // Elemento DOM para texto de vida
enemyCountEl       // Elemento DOM para contador de enemigos
playerBarFillEl    // Barra verde/roja de vida
playerBarTextEl    // Texto con valores numéricos
enemyBars          // Map<Enemy, HTMLElement> - barras de enemigos
```

**Actualización**:
```typescript
update(data: { player: {playerHealth, maxPlayerHealth}, enemyCount, enemies }) {
  // Actualiza textos, barras y posiciona barras de enemigos
}
```

---

## 18. Explosion (explosion/Explosion.ts)
**Utilidad**: Efecto de partículas cuando un enemigo es destruido.

**Apariencia**: 30 puntos naranjas que se expanden y se darken con el tiempo.

**Propiedades**:
```typescript
points      // THREE.Points - grupo de partículas
velocities // Vector3[] - velocidades de cada partícula
age = 0    // Tiempo transcurrido
lifetime = 1000  // Duración en ms
```

**Animación**:
- Las partículas se mueven en direcciones aleatorias hacia afuera
- El color transiciona de naranja (0xff6600) a gris oscuro (0x444444)
- Cuando age > lifetime, se destroy()

**Métodos**:
```typescript
update(delta)  // Mueve partículas, actualiza color, verifica lifetime
isAlive()     // Retorna true si está vigente
destroy()     // Limpia recursos
```

---

## 19. DirectionHelper (rayo/rayo.ts)
**Utilidad**: Muestra una flecha frente al barco indicando la dirección.

**Nota**: Actualmente deshabilitado (comentado en main.ts). Podría reactivarse para debugging.

---

## Comunicación Cliente-Servidor

### Flujo de conexión:
1. Game crea NetworkManager
2. NetworkManager conecta a `localhost:3000`
3. Servidor registra al jugador y envía `currentPlayers`
4. Cliente crea RemotePlayers para cada jugador existente

### Eventos del servidor:
```typescript
currentPlayers    // Array de { id, position, rotation }
playerJoined      // { id } - nuevo jugador
playerMoved       // { id, position, rotation } - actualización
playerDisconnected // { id } - jugador salió
```

### Emisión del cliente:
```typescript
playerMove // { position: {x,y,z}, rotation: {y} } - cada frame
```

---

## Refactorizaciones Sugeridas

### Alta Prioridad
1. **Separar Game en Game y GameLoop** - El game loop debería ser una clase independiente
2. **InputManager genérico** - Agregar `isKeyDown(key)` que soporte cualquier tecla
3. **Enemy con modelo 3D** - Reemplazar box rojo por modelo GLB
4. **IA de enemigos mejorada** - Enemigos que flanqueen, disparen, etc.
5. **Sistema de puntuación** - Contar enemigos derrotados
6. **Game over y reinicio** - Qué pasa cuando el jugador muere

### Media Prioridad
7. **Configuración vía constructor** - Pasar opciones a Ocean, Boat, EnemyManager
8. **Agregar dispose()** - Limpiar recursos al cerrar/juego
9. **Partículas de estela** - Efecto de agua atrás del barco
10. **Múltiples tipos de enemigos** - Con diferentes comportamientos
11. **Predicción de movimiento** - Para interpolación suave de RemotePlayers

### Baja Prioridad
12. **Más efectos de sonido** - Motor, explosiones, impactos
13. **Interfaz IMovable** - Para objetos que se muevan
14. **Inyección de dependencias** - Pasar servicios en constructor
15. **Tests unitarios** - Coverage de lógica importante