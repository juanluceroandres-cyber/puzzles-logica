# Logic Lab --- Especificación de minijuegos

## 1. Objetivo del proyecto

Crear una página web interactiva de desafíos de lógica inspirada en las
mecánicas de ciertos minijuegos de **Wuthering Waves**.

La aplicación tendrá **5 minijuegos**, cada uno con **3 dificultades:
Fácil, Normal y Difícil**.

La prioridad no es copiar la interfaz ni los recursos gráficos del juego
original, sino reproducir las **mecánicas de resolución** con una
identidad visual propia.

### Minijuegos

1.  **Pintar el lienzo --- Overflowing Palette**
2.  **Conectar colores --- Signal Hub**
3.  **Smartprint Cube**
4.  **Breach Protocol --- Hackeo estilo Cyberpunk**
5.  **Energy Matrix**

------------------------------------------------------------------------

# 2. Requisitos generales

## Interfaz

La aplicación debe tener:

-   Pantalla de inicio.
-   Selección de minijuego.
-   Selección de dificultad.
-   Pantalla de juego.
-   Pantalla de victoria.
-   Botón de reiniciar.
-   Botón para volver al menú.
-   Contador de movimientos cuando corresponda.
-   Temporizador cuando corresponda.
-   Puntuación.
-   Indicador de progreso.
-   Diseño responsive para PC y móvil.

No utilizar assets, personajes, logos, música ni imágenes oficiales de
Wuthering Waves o Cyberpunk 2077.

Crear una identidad visual propia para la aplicación.

## Tecnologías

Preferentemente:

-   React
-   TypeScript
-   CSS
-   Vite

No utilizar backend inicialmente.

Guardar estadísticas simples con `localStorage`.

------------------------------------------------------------------------

# 3. Sistema de dificultades

Cada juego debe tener exactamente tres dificultades:

## Fácil

Diseñado para aprender la mecánica.

-   Tableros pequeños.
-   Pocas piezas.
-   Reglas básicas.
-   Mayor margen de movimientos/tiempo.

## Normal

La mecánica completa empieza a importar.

-   Tableros medianos.
-   Más piezas.
-   Menos movimientos.
-   Obstáculos o reglas secundarias.

## Difícil

Debe requerir planificación antes de realizar movimientos.

-   Tableros grandes.
-   Más colores/piezas.
-   Menor margen de error.
-   Obstáculos.
-   Combinación de mecánicas.

La dificultad NO debe basarse solamente en hacer todo más grande. Debe
introducir nuevas decisiones lógicas.

------------------------------------------------------------------------

# 4. MINIJUEGO 1 --- PINTAR EL LIENZO

## Concepto

Inspirado en Overflowing Palette.

El jugador observa un lienzo dividido en bloques de diferentes colores.

El objetivo es conseguir que **todo el lienzo tenga un único color
objetivo**.

Al seleccionar un color y aplicarlo a un bloque, el nuevo color se
propaga por todos los bloques conectados de la misma región.

La clave es elegir correctamente el orden de colores.

## Mecánica

Ejemplo:

``` text
R R B B
R G G B
Y G B B
Y Y Y B
```

El jugador selecciona un color y después una región.

Si selecciona:

``` text
Verde
```

sobre una región roja conectada, esa región pasa a ser verde.

Los bloques verdes conectados posteriormente forman una región mayor.

## Reglas

-   Cada acción consume un movimiento.
-   El jugador debe convertir todo el tablero al color objetivo.
-   El número máximo de movimientos depende de la dificultad.
-   Reiniciar no debe considerarse una victoria.
-   Debe existir una solución válida para todos los niveles.

## Dificultades

### Fácil

-   Tablero: 5x5.
-   3 colores.
-   Una sola región inicial grande por color.
-   6-8 movimientos permitidos.
-   Sin obstáculos.
-   Objetivo claramente visible.

### Normal

-   Tablero: 7x7.
-   4 colores.
-   Regiones más fragmentadas.
-   5-7 movimientos.
-   El jugador debe planificar el orden.

### Difícil

-   Tablero: 9x9.
-   5 colores.
-   Regiones fragmentadas.
-   6-8 movimientos.
-   Algunos colores aparecen en varias regiones separadas.
-   Solución óptima requerida para obtener puntuación máxima.

## Victoria

Mostrar:

-   Movimientos utilizados.
-   Movimientos restantes.
-   Tiempo.
-   Puntuación.
-   Si encontró una solución óptima.

------------------------------------------------------------------------

# 5. MINIJUEGO 2 --- CONECTAR COLORES

## Concepto

Inspirado en el minijuego de Signal Hub.

El tablero contiene pares de nodos del mismo color.

El jugador debe conectar cada par mediante caminos.

### Regla principal

Los caminos:

-   Deben conectar nodos del mismo color.
-   No pueden cruzarse.
-   No pueden ocupar una misma casilla.
-   Deben permanecer dentro del tablero.

## Mecánica

Ejemplo:

``` text
🔴 . . . 🔴
. . 🔵 . .
. 🟢 . 🔵 .
🟢 . . . .
```

El jugador dibuja caminos entre los pares.

## Dificultades

### Fácil

-   Tablero 5x5.
-   3 pares de colores.
-   Caminos sencillos.
-   Sin obstáculos.
-   Solución única preferentemente.

### Normal

-   Tablero 7x7.
-   4 pares.
-   Obstáculos.
-   Algunas rutas requieren rodear otras conexiones.
-   El orden de resolución empieza a ser importante.

### Difícil

-   Tablero 9x9 o 10x10.
-   5-6 pares.
-   Obstáculos.
-   Zonas estrechas.
-   Caminos largos.
-   Algunas conexiones deben resolverse antes que otras para no bloquear
    el tablero.

## Controles

PC:

-   Click + arrastrar.

Móvil:

-   Touch + arrastrar.

El camino debe ajustarse a una cuadrícula.

## Victoria

El juego gana cuando todos los pares están correctamente conectados.

------------------------------------------------------------------------

# 6. MINIJUEGO 3 --- SMARTPRINT CUBE

## Concepto

Inspirado en Smartprint Cube Reboot.

El jugador controla un bloque que se mueve por una cuadrícula.

El bloque puede ser:

-   Cuadrado.
-   Rectangular.

El objetivo es llevarlo hasta la casilla objetivo.

La orientación del bloque importa.

## Mecánica del bloque

El cuadrado permanece en una posición equivalente al moverse.

El rectángulo cambia de orientación al rodar.

Ejemplo conceptual:

``` text
Estado vertical:

[██]
[██]

↓

movimiento

[████]
```

El objetivo puede exigir que el bloque termine:

-   De pie.
-   Acostado.

## Dificultades

### Fácil

-   Tablero 5x5.
-   Solo bloque cuadrado.
-   Objetivo simple.
-   Sin obstáculos.
-   Movimientos ilimitados o contador amplio.

### Normal

-   Tablero 7x7.
-   Bloque rectangular.
-   El objetivo requiere una orientación específica.
-   Huecos.
-   Algunas plataformas.
-   Número de movimientos limitado.

### Difícil

-   Tablero 9x9 o 10x10.
-   Bloque rectangular.
-   Obstáculos.
-   Bloques rompibles.
-   Plataformas que desaparecen.
-   Módulos de rebote.
-   Posibilidad de dos bloques.
-   Láseres o zonas peligrosas.

## Reglas importantes

-   El bloque no puede salir del tablero.
-   Si cae en un hueco, reinicia la posición.
-   Los láseres reinician el intento.
-   Las plataformas rompibles desaparecen después de abandonar la
    casilla.
-   El objetivo rectangular exige orientación horizontal.
-   El objetivo cuadrado exige que el bloque esté de pie.

## Controles

-   Flechas del teclado.
-   WASD.
-   Botones táctiles en móvil.

------------------------------------------------------------------------

# 7. MINIJUEGO 4 --- BREACH PROTOCOL

## Concepto

Minijuego de hackeo inspirado en el sistema Breach Protocol de Cyberpunk
2077.

La pantalla contiene:

1.  Código Matrix.
2.  Secuencia requerida.
3.  Buffer.
4.  Temporizador.

El jugador debe seleccionar códigos en un orden específico.

## Mecánica principal

La primera selección debe realizarse en la primera fila.

Después:

-   Si seleccionas una celda, la siguiente selección debe hacerse en la
    **columna** de esa celda.
-   La siguiente debe hacerse en la **fila** de la nueva celda.
-   Se continúa alternando fila → columna → fila → columna.

Los códigos seleccionados se almacenan en el buffer.

El objetivo es construir la secuencia requerida exactamente en el orden
correcto.

## Ejemplo

Matriz:

``` text
7A   55   1C   BD
FF   7A   55   E9
1C   BD   7A   55
E9   1C   FF   7A
```

Objetivo:

``` text
7A → 1C → FF
```

El jugador debe encontrar una ruta válida respetando las reglas de
fila/columna.

## Dificultades

### Fácil

-   Matriz 4x4.
-   1 secuencia.
-   Secuencia de 3 códigos.
-   Buffer de 4-5 espacios.
-   Temporizador amplio.

### Normal

-   Matriz 5x5.
-   2 secuencias.
-   Secuencias de 3-4 códigos.
-   Buffer limitado.
-   Menor tiempo.

### Difícil

-   Matriz 6x6.
-   2-3 secuencias.
-   Secuencias de 4-5 códigos.
-   Buffer muy limitado.
-   Poco tiempo.
-   Las secuencias pueden compartir códigos.
-   El jugador debe planificar varias jugadas antes de comenzar.

## Importante

No permitir seleccionar cualquier celda.

El movimiento debe validar siempre:

``` text
Primer movimiento → fila inicial
Segundo movimiento → columna anterior
Tercer movimiento → fila anterior
Cuarto movimiento → columna anterior
...
```

Si la secuencia final del buffer no coincide con el objetivo, el intento
falla.

------------------------------------------------------------------------

# 8. MINIJUEGO 5 --- ENERGY MATRIX

## Concepto

Inspirado en Energy Matrix de Wuthering Waves.

El jugador recibe varias piezas de diferentes formas y debe colocarlas
sobre una cuadrícula para cubrir todas las casillas objetivo.

Las piezas pueden rotarse.

## Objetivo

Cubrir todas las casillas oscuras/objetivo.

Las casillas secundarias pueden permanecer descubiertas si el nivel así
lo especifica.

## Ejemplo

Tablero:

``` text
⬛ ⬛ ⬜ ⬜
⬛ ⬛ ⬜ ⬛
⬜ ⬜ ⬜ ⬛
⬛ ⬛ ⬛ ⬛
```

Piezas:

``` text
██
██

███

█
██
```

El jugador debe rotarlas y colocarlas para cubrir las casillas
requeridas.

## Dificultades

### Fácil

-   Tablero 5x5.
-   3 piezas.
-   Piezas sencillas.
-   Rotación de 90°.
-   Sin piezas engañosas.
-   Todas las piezas necesarias tienen una posición bastante evidente.

### Normal

-   Tablero 7x7.
-   4-5 piezas.
-   Formas diferentes.
-   Rotaciones.
-   Algunas piezas tienen varias posiciones posibles.
-   El jugador debe descubrir la combinación correcta.

### Difícil

-   Tablero 8x8 o 9x9.
-   6-7 piezas.
-   Formas irregulares.
-   Rotaciones.
-   Algunas piezas pueden parecer correctas pero dejar una casilla
    imposible.
-   Debe existir una solución única o muy limitada.

## Controles

PC:

-   Click para seleccionar pieza.
-   R para rotar.
-   Click en tablero para colocar.

Móvil:

-   Tap para seleccionar.
-   Botón de rotación.
-   Tap para colocar.

## Restricciones

-   Una pieza no puede ocupar dos veces la misma casilla.
-   No puede salir del tablero.
-   Las piezas no pueden superponerse.
-   La victoria ocurre cuando todas las casillas objetivo están
    cubiertas.

------------------------------------------------------------------------

# 9. SISTEMA DE PUNTUACIÓN

Cada juego debe utilizar una puntuación de 0 a 1000.

Factores:

-   Tiempo.
-   Movimientos.
-   Reinicios.
-   Dificultad.

Ejemplo:

``` text
Puntuación base: 1000

- Tiempo excesivo: penalización
- Movimientos adicionales: penalización
- Reinicio: penalización
```

La puntuación máxima debe conseguirse resolviendo el nivel rápidamente y
con pocos movimientos.

No hacer que la puntuación dependa exclusivamente de la velocidad: un
jugador que encuentra una solución elegante debe poder superar a alguien
que simplemente juega muy rápido.

------------------------------------------------------------------------

# 10. PROGRESIÓN

El menú principal debe mostrar:

``` text
╔══════════════════════════════════════╗
║              LOGIC LAB               ║
║                                      ║
║   Elige un desafío                   ║
║                                      ║
║   🎨 Pintar el lienzo                ║
║   🔗 Conectar colores                ║
║   🧊 Smartprint Cube                 ║
║   💻 Breach Protocol                 ║
║   ⚡ Energy Matrix                   ║
║                                      ║
╚══════════════════════════════════════╝
```

Al seleccionar un juego:

``` text
Selecciona dificultad

[ FÁCIL ]
[ NORMAL ]
[ DIFÍCIL ]
```

------------------------------------------------------------------------

# 11. Arquitectura recomendada

Separar cada juego en su propio componente.

Ejemplo:

``` text
src/
├── components/
│   ├── MainMenu.tsx
│   ├── GameSelector.tsx
│   ├── DifficultySelector.tsx
│   ├── GameHeader.tsx
│   ├── GameResult.tsx
│   └── ScoreDisplay.tsx
│
├── games/
│   ├── OverflowingPalette/
│   │   ├── OverflowingPalette.tsx
│   │   ├── paletteLogic.ts
│   │   ├── paletteLevels.ts
│   │   └── types.ts
│   │
│   ├── SignalHub/
│   │   ├── SignalHub.tsx
│   │   ├── pathLogic.ts
│   │   ├── signalLevels.ts
│   │   └── types.ts
│   │
│   ├── SmartprintCube/
│   │   ├── SmartprintCube.tsx
│   │   ├── cubeLogic.ts
│   │   ├── cubeLevels.ts
│   │   └── types.ts
│   │
│   ├── BreachProtocol/
│   │   ├── BreachProtocol.tsx
│   │   ├── breachLogic.ts
│   │   ├── breachLevels.ts
│   │   └── types.ts
│   │
│   └── EnergyMatrix/
│       ├── EnergyMatrix.tsx
│       ├── matrixLogic.ts
│       ├── matrixLevels.ts
│       └── types.ts
│
├── data/
│   └── levels.ts
│
├── utils/
│   ├── scoring.ts
│   ├── timer.ts
│   └── storage.ts
│
└── App.tsx
```

------------------------------------------------------------------------

# 12. Generación de niveles

No escribir toda la lógica de niveles directamente dentro de los
componentes.

Cada nivel debe ser un objeto de datos.

Ejemplo:

``` ts
const level = {
  difficulty: "normal",
  boardSize: 7,
  maxMoves: 6,
  targetColor: "blue",
  board: [...]
};
```

Esto permitirá agregar niveles posteriormente sin modificar la lógica
del juego.

------------------------------------------------------------------------

# 13. Requisitos de calidad

Cada puzzle debe:

-   Tener solución garantizada.
-   No depender de azar para ser resoluble.
-   Tener una explicación/tutorial antes de jugar.
-   Tener botón de reinicio.
-   Tener feedback visual inmediato.
-   Ser jugable con mouse y teclado cuando sea posible.
-   Ser jugable en pantalla táctil.
-   No utilizar `alert()` para feedback normal.
-   No recargar la página al cambiar de juego.
-   Mantener los estados separados entre minijuegos.

------------------------------------------------------------------------

# 14. Orden recomendado de implementación

No desarrollar los cinco juegos simultáneamente.

Implementar en este orden:

### Fase 1

Overflowing Palette.

### Fase 2

Signal Hub.

### Fase 3

Energy Matrix.

### Fase 4

Breach Protocol.

### Fase 5

Smartprint Cube.

### Fase 6

Sistema de puntuación.

### Fase 7

Menú y selección de dificultad.

### Fase 8

Responsive/mobile.

### Fase 9

Pulido visual y animaciones.

### Fase 10

Pruebas completas.

------------------------------------------------------------------------

# 15. Regla fundamental para Cursor

Antes de implementar cualquier juego:

1.  Explicar brevemente la mecánica.
2.  Crear la estructura de datos.
3.  Crear al menos 3 niveles de prueba.
4.  Implementar la lógica.
5.  Implementar la interfaz.
6.  Probar las condiciones de victoria.
7.  Probar reinicio.
8.  Probar los tres niveles de dificultad.
9.  No modificar otros juegos que ya funcionen.

No generar una aplicación enorme de una sola vez.

Construir el proyecto incrementalmente y mantener el código modular.

------------------------------------------------------------------------

# 16. Objetivo final

La aplicación debe sentirse como una pequeña plataforma de desafíos de
lógica, no como una colección de ejercicios escolares.

El usuario debe tener que:

-   observar,
-   anticipar,
-   probar,
-   corregir,
-   planificar,
-   optimizar.

La dificultad debe aumentar principalmente por la **complejidad de las
decisiones**, no únicamente por agregar más elementos.
