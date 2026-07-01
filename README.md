# Q2N Barber Shop - Sistema de packs

App React + Vite para vender packs de cortes con transferencia manual, panel de cliente y panel administrador.

## Stack

- React + Vite
- Firebase Authentication con Google
- Cloud Firestore
- Firebase Hosting
- Firebase Cloud Functions opcionales

## Configuracion Firebase

1. Crear un proyecto en Firebase.
2. Activar Authentication con proveedor Google en Authentication > Sign-in method > Google. Elegir un email de soporte y guardar.
3. Crear Cloud Firestore.
4. Copiar `.env.example` como `.env.local` y completar:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

5. Instalar Firebase CLI si falta:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

6. En Authentication > Settings > Authorized domains agregar:

- `localhost`
- `127.0.0.1`
- `walterdif20.github.io`

## Desarrollo

```bash
npm install
npm run dev
```

## Primer usuario admin

1. Iniciar sesion con Google desde `/login`.
2. Ir a Firestore > `users/{uid}`.
3. Cambiar el campo:

```json
{
  "role": "admin"
}
```

4. Volver a iniciar sesion. El panel admin queda disponible en `/admin`.

## Modelo principal

- `users`: perfiles y roles.
- `barberSettings/main`: alias, nombre del negocio e instrucciones.
- `packTemplates`: packs comerciales configurables.
- `userPacks`: packs comprados por usuarios.
- `visitRequests`: visitas informadas.
- `packUsageLogs`: historial de acciones importantes.

## Reglas de seguridad

Las reglas estan en `firestore.rules`.

Deploy:

```bash
npm run deploy:firebase:rules
```

Importante: el usuario no ve estados internos en la UI. Firestore no permite ocultar campos individuales dentro de un documento leido; si se requiere ocultamiento tecnico absoluto del campo `internalPaymentStatus`, conviene crear una coleccion publica derivada para usuario o mover lectura de packs a Cloud Functions.

## Hosting Firebase

```bash
npm run deploy:firebase
```

El deploy usa `dist` y rewrite SPA a `index.html`.

## Cloud Functions opcionales

La carpeta `functions` incluye:

- `scheduledExpireUserPacks`: corre diariamente y marca packs activos vencidos como `expired`.
- `confirmVisit`: callable opcional para confirmar visitas desde backend.

Instalar dependencias y desplegar:

```bash
cd functions
npm install
cd ..
npm run deploy:firebase:functions
```

Las funciones usan region `southamerica-east1`.

## Flujo cliente

1. Inicia sesion con Google.
2. Ve packs disponibles.
3. Selecciona un pack.
4. Ve alias y monto.
5. Marca "Ya realice la transferencia".
6. El pack aparece activo inmediatamente.
7. Puede avisar proxima visita desde un pack activo.

El cliente no ve textos de revision manual.

## Flujo admin

1. Crea o edita packs comerciales.
2. Ve compras con pagos pendientes de revision.
3. Aprueba, rechaza, deshabilita o reactiva packs.
4. Ve visitas informadas.
5. Confirma una visita y descuenta 1 corte con transaccion.
6. Si el pack llega a 0 cortes, pasa a `consumed`.

## Validacion

```bash
npm run build
```
