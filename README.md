# Momentum

Momentum es una aplicación móvil de **seguimiento de hábitos** creada con Expo SDK 57, React Native, TypeScript y Expo Router. La navegación usa un Stack basado en React Navigation y protege las pantallas privadas mientras no exista una sesión local.

## Funcionalidades implementadas

- Registro local con usuario y contraseña.
- Inicio de sesión que valida los datos guardados.
- Rutas protegidas: Home y creación de hábitos requieren una sesión activa.
- Alta de hábitos diarios o semanales, listado, marcado como realizado y eliminación.
- El estado se guarda por fecha o semana: un hábito diario se renueva al día siguiente y uno semanal al comenzar otra semana.
- Persistencia de usuarios, sesión y hábitos con AsyncStorage.
- Recordatorio local opcional en una hora elegida por el usuario: diario o semanal según la frecuencia del hábito.
- Canal de notificaciones específico para Android.
- Interfaz completa en español, adaptable y construida con `StyleSheet`.
- Componentes reutilizables: `AppButton`, `FormField` y `HabitItem`.
- Tests con Jest y React Native Testing Library para componentes y validaciones.

## Requisitos

- Node.js 22.13 o superior.
- npm.
- Expo Go en un dispositivo, o un emulador configurado desde Android Studio para usar la development build.

## Instalación y ejecución

```bash
npm install
npm start
```

Ese comando inicia la development build, que permite probar toda la aplicación, incluidas las notificaciones.

Para abrirla desde Expo Go en un celular conectado a la misma red Wi-Fi:

```bash
npm run start:go
```

Escaneá el código QR con Expo Go. La gestión de hábitos y los recordatorios locales diarios o semanales funcionan normalmente. Momentum carga únicamente las APIs locales compatibles para evitar el registro de notificaciones push que Expo Go no admite en Android.

Con un emulador Android iniciado desde Android Studio, también se puede usar:

```bash
npm run android
```

Para compilar e instalar una nueva versión nativa:

```bash
npm run android:native
```

En Windows, si la compilación nativa informa que una ruta supera los 260 caracteres, copiá el proyecto a una ruta corta, por ejemplo `C:\dev\Momentum`, y ejecutá allí ese comando. La ejecución habitual con `npm run android` no necesita recompilar el proyecto nativo.

La primera vez que se crea un hábito con recordatorio, Android solicitará permiso para mostrar notificaciones. Los hábitos diarios se notifican todos los días a la hora elegida; los semanales, el mismo día de la semana en que fueron creados.

La aplicación también incluye una development build para probarla como aplicación nativa independiente. Ejecutá `npm start` o `npm run android` para esa modalidad, y `npm run start:go` para abrirla desde Expo Go.

## Verificaciones

```bash
npm test
npm run lint
npm run typecheck
npx expo-doctor
```

Los tests se ejecutan una sola vez con `npm test` y no requieren un dispositivo conectado.

Enlace Video DEMO de la app

https://www.youtube.com/shorts/F-Uuq7X-678
