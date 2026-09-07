# 🗺️ Roadmap de Producto & Arquitectura: The Pirate Bay

Este documento detalla el estado actual del desarrollo, las características completadas y la hoja de ruta técnica y de producto para **The Pirate Bay**.

---

## 📊 Estado Actual del Proyecto (Changelog de Features)

### ✅ 1. Persistencia y Base de Datos (Completado)
- [x] **Base de Datos PostgreSQL (Neon Serverless)**: Conexión SSL robusta configurada y testeada.
- [x] **Esquema de Tablas (`schema.sql`)**:
  - `users`: Registro permanente e invitados, email, contraseña con hash bcrypt, avatar, oro acumulado, nivel y XP.
  - `user_stats`: Registro histórico acumulativo de kills, deaths, daño total, partidas jugadas y ganadas.
  - `match_history`: Historial de partidas, ganadores, duración y desglose JSON de estadísticas.
- [x] **Servicio de Autenticación (`AuthService.ts` / `UserRepository.ts`)**:
  - Generación y verificación de tokens JWT seguros.
  - Registro de usuarios con validación de credenciales.
  - Inicio de sesión con email o username.
  - Modo Invitado instantáneo persistido en base de datos.
  - Inicio de sesión y registro con Google OAuth (Google Identity Services con verificación de ID Token oficial).
  - Endpoints REST `/api/auth/*` integrados con Express.

### ✅ 2. Experiencia de Entrada y Menú (Completado)
- [x] **Tabs de Acceso Modular**:
  - **Invitado**: Nombre personalizable o generador de apodos piratas aleatorios (`🎲 Aleatorio`) con entrada en 1 clic sin fricción.
  - **Iniciar Sesión**: Formulario de credenciales con estética naval oscura + botón oficial de Google.
  - **Registrarse**: Creación de cuenta con confirmación de contraseña + botón de Google.
- [x] **Persistencia de Sesión Local**: Guardado de JWT en `localStorage`, decodificación de datos y sesión persistente al recargar la página.
- [x] **Barra de Estado del Capitán**: Indicador de rango ("Invitado" / "Capitán"), balance de oro y botón de cambio de capitán.

### ✅ 3. Enrutamiento, Navegación y Control de Flujo (Completado)
- [x] **Soporte Completo de Historial de Navegador (`popstate` / Hashes)**:
  - Navegación clara con URLs amigables: `#menu`, `#lobbies`, `#lobby/:id`, `#battle`.
  - El botón "Atrás" y "Adelante" del navegador ya no expulsan al usuario de la aplicación.
  - Salida ordenada de lobbies notificando al servidor de forma limpia al retroceder.
- [x] **Menú de Pausa In-Game (`ESC` / ⚙️)**:
  - Componente modal `GamePauseMenu.tsx` integrado en la vista de batalla.
  - Modal con confirmación para "Abandonar Batalla" y volver ordenadamente a la lista de salas.
  - Guía rápida de controles integrada dentro del menú de pausa.

### ✅ 4. Sistema de Lobbies y Matchmaking (Completado)
- [x] **Creación y Explorador de Salas**:
  - Configuración de nombre de sala y límite de jugadores (2 a 8).
  - Lista de salas en vivo con actualización reactiva vía WebSockets (`lobbiesUpdated`).
- [x] **Sala de Espera (Pre-Battle Lobby)**:
  - Selección de barco (*El Temido Pirata* vs *Man-o-War Inglés* / Fragata) con ficha comparativa de atributos.
  - Selección de escuadra (*Imperio Rojo* vs *Armada Azul*).
  - **Corrección de sincronización**: Idempotencia al unirse (`onJoin`), eliminando duplicados o jugadores fantasma (`"Jugador"`).
  - Botón de salida de sala con desvinculación automática en el servidor.

### ✅ 5. Combate 3D y Marcador en Vivo (Completado)
- [x] **Marcador Desplegable con Tecla `TAB` (`ScoreboardModal.tsx`)**:
  - División visual en dos escuadras: **Armada Azul** vs **Imperio Rojo**.
  - Estadísticas individuales en tiempo real: Capitán, Navío, Bajas (Kills), Hundimientos (Deaths), Daño Infligido y Estado (*A flote* / *Hundido*).
  - Distintivo visual dorado `[TÚ]` para identificar al jugador local sin confusiones.
  - Conteo global de bajas de la escuadra en el encabezado.
  - Integrado vía socket `scoreboardUpdated` sincronizado en cada impacto y hundimiento.

---

## 🎯 Próximas Funcionalidades (Roadmap Priorizado)

```mermaid
flowchart TD
    subgraph Fase 1: Ciclo de Partida y Persistencia
        A[Fin de Partida: Victoria / Derrota] --> B[Guardado en DB: Kills, Oro y XP]
        B --> C[Pantalla de Resultados Post-Match]
        A --> D[Killfeed en Combate: Avisos en Vivo]
    end

    subgraph Fase 2: Social & Calidad de Vida
        E[Chat de Texto en Lobby y Batalla]
        F[Astillero 3D: Vista previa interactiva de barcos]
        G[Balanceo Automático de Equipos]
    end

    subgraph Fase 3: Progresión y Economía
        H[Tienda del Astillero: Nuevos Navíos con Oro]
        I[Sistema de Niveles, Rangos y Títulos Piratas]
        J[Bitácora de Logros Desbloqueables]
    end

    subgraph Fase 4: Modo Cazarrecompensas
        K[Tablón de Se Busca: Contratos de Sangre]
        L[Infiltración en Sala de la Presa]
        M[Alarma Sonora y Recompensa Doble]
    end

    Fase 1 --> Fase 2
    Fase 2 --> Fase 3
    Fase 3 --> Fase 4
```

---

## 🚀 Fase 1: Ciclo de Partida Completo & Cierre Post-Match (Inmediata)

### 1.1 Pantalla de Fin de Partida (Post-Match Summary)
- **Condición de Victoria**:
  - Límite de bajas alcanzado (ej. 10 bajas por equipo) o límite de tiempo (ej. 8 minutos).
- **Flujo**:
  1. El servidor detecta la condición y emite el evento `matchEnded` con el equipo ganador y los resultados finales.
  2. El cliente congela los controles y despliega la pantalla cinemática de fin de combate:
     - Cartel épico: **¡VICTORIA PIRATA!** o **¡DERROTA NAVAL!**.
     - Cuadro de honor: **MVP de la partida** (más bajas o más daño).
     - Resumen de recompensas ganadas:
       - `+150 Oro` por participar (+ bonus si ganó el equipo).
       - `+300 XP` de experiencia.
     - Botón "Volver a la Lista de Salas" o "Revancha".

### 1.2 Persistencia de Resultados en PostgreSQL
- Al dispararse `matchEnded`, el servidor guarda automáticamente:
  - Registro en `match_history` con `scores_json` completo.
  - `UPDATE user_stats`: suma de `total_kills`, `total_deaths`, `damage_dealt`, `matches_played` y `matches_won`.
  - `UPDATE users`: acreditación del oro y XP ganados al usuario registrado o invitado.

### 1.3 Killfeed en Combate (Notificaciones de Bajas)
- Avisos animados flotantes en la esquina superior derecha del HUD durante la partida:
  > `💥 Capitán_Morgan [Cañón Frontal] ➔ Barbanegra`
- Desaparición suave con fade-out tras 4 segundos.

---

## ⚓ Fase 2: Social, Astillero 3D & Mejoras de Combate

### 2.1 Chat de Texto Integrado
- **Chat de Lobby**: Conversación previa entre capitanes antes de iniciar la batalla.
- **Chat In-Game**: Tecla `ENTER` para abrir caja de texto con filtro de chat global o de equipo (*All* / *Team*).

### 2.2 Astillero 3D Interactivo (3D Ship Preview)
- Reemplazar las imágenes fijas en la selección de nave por un visor interactivo Three.js:
  - El navío seleccionado flota sobre un dique o aguas calmas en el menú.
  - Posibilidad de rotar 360° con el ratón e inspeccionar cañones y detalles del casco.

### 2.3 Balanceo y Preparación de Equipos
- Indicador de estado "Listo" (`Ready`) por jugador en la sala de espera.
- Bloqueo de inicio si un equipo tiene una desventaja severa de jugadores.

---

## 🪙 Fase 3: Economía Pirata, Desbloqueos & Logros

### 3.1 Tienda del Astillero & Personalización
- Catálogo de navíos desbloqueables con el oro ganado en combate:
  - *Balandra Veloz* (alta velocidad, baja vida).
  - *Galeón de Guerra* (blindaje pesado, 6 cañones por banda).
- Diseños cosméticos de banderas y velas.

### 3.2 Sistema de Rangos y Niveles
- Niveles piratas calculados por XP:
  - Nivel 1: *Grumete*
  - Nivel 5: *Marinero de Primera*
  - Nivel 10: *Contramaestre*
  - Nivel 20: *Capitán Temido*
  - Nivel 50: *Señor de los Mares*

### 3.3 Logros (Achievements)
- *Tirador Certero*: 50 disparos acertados a larga distancia.
- *Terror del Caribe*: 5 bajas en una sola partida.
- *Superviviente*: Ganar una batalla con menos del 15% de vida.

---

## ☠️ Fase 4: Modo Cazarrecompensas (Bounty Hunting)

- **Tablón de Se Busca (Bounty Board)** en el menú principal:
  - Lista capitanes con rachas activas en otras salas con una recompensa en oro sobre su cabeza.
- **Infiltración**:
  - Al aceptar el contrato, el cazador entra directamente al equipo rival de la presa.
- **Alarma Temprana en el HUD**:
  - Suena campana de abordaje en el barco de la presa:
    > `⚠️ ¡PRESA MARCADA! Un cazador ha entrado a tus aguas tras tu recompensa.`
- **Doble Recompensa**:
  - Si el cazador lo hunde, cobra el contrato.
  - Si la presa hunde a su cazador (*"Cazador Cazado"*), se queda con el botín.

---

## 🛠️ Resumen de Stack Tecnológico Actual

| Componente | Tecnología | Rol |
| :--- | :--- | :--- |
| **Motor 3D** | Three.js + GLTF | Renderizado del océano, navíos, cañones y proyectiles |
| **Frontend UI** | React 18 + Tailwind CSS | Menús, lobbies, HUD, scoreboard y autenticación |
| **Backend** | Node.js + Express + TypeScript | API REST y servicios |
| **Multiplayer Loop** | Socket.io | Sincronización a 60 FPS de posiciones, disparos y daño |
| **Base de Datos** | PostgreSQL (Neon Serverless) | Usuarios, estadísticas, historial de partidas |
| **Seguridad / Auth** | JWT + Bcrypt + Google OAuth | Autenticación híbrida persistente |
