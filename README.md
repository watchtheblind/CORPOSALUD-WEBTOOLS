
# CORPOSALUD WebTools - Plataforma Documental Enterprise

Plataforma escalable de nivel empresarial para el procesamiento, análisis y gestión segura de documentos digitales (arquitectura tipo iLovePDF). Este ecosistema está diseñado bajo los principios de **Arquitectura Hexagonal**, desacoplamiento mediante **Microservicios**, comunicación asíncrona dirigida por eventos y persistencia híbrida (Nube/Caché).

---

## 🛠️ Stack Tecnológico de Alto Rendimiento

* **Frontend (UI):** Next.js 14+ (App Router) corriendo sobre **TypeScript**, optimizado para la gestión de streams y carga de archivos grandes mediante técnicas de *chunking*.
* **API Gateway (Orquestador):** NestJS ejecutado de forma nativa por **Bun**, garantizando tiempos mínimos de arranque, bajo consumo de memoria RAM y validación ultra rápida de DTOs y middlewares de seguridad (JWT).
* **Persistent Layer:** **Supabase (PostgreSQL)** en la nube con pooler de conexiones (Transaction Mode, puerto 6543) administrado a través de **Prisma ORM**.
* **Cache & Rate Limiting:** **Redis**, encargado de almacenar estados temporales de procesamiento y mitigar ataques de denegación de servicio (*Rate Limit*).
* **Event Broker:** **RabbitMQ**, gestionando las colas de trabajo asíncronas de manera robusta y garantizando tolerancia a fallos.
* **Processing Engine (Workers):** Microservicio en **FastAPI (Python 3.11)** optimizado con librerías nativas en C (`PyMuPDF`) para manipulación veloz de PDFs y `Pandas` para auditoría, análisis y procesamiento de metadatos pesados.

---

## 📐 1. Diagramas de Arquitectura y Orquestación

### A. Topología Global de Microservicios
El siguiente diagrama detalla cómo interactúan los componentes dentro del monorepo. Nótese que el **Worker de FastAPI** y el broker de **RabbitMQ** se encuentran dentro de una red privada virtual de Docker sin exposición directa a Internet, blindando el motor de procesamiento de ataques externos.

```mermaid
graph TD
    User((Usuario Final)) -->|HTTPS / WSS| Frontend[Next.js App]
    Frontend -->|Rest API / Auth| Gateway[API Gateway: NestJS + Bun]
    
    subgraph RedPrivadaDocker [Red Privada Docker]
        Gateway -->|Publica Tareas| RabbitMQ[[Broker: RabbitMQ]]
        Gateway -->|Cache & Rate Limit| Redis[(Redis In-Memory)]
        RabbitMQ -->|Consume Mensajes| Worker[Engine Worker: FastAPI + Python]
    end

    subgraph InfraestructuraCloudExterna [Infraestructura Cloud Externa]
        Gateway -->|Pool de Conexiones| Supabase[(Supabase Postgres)]
        Gateway -->|Upload Chunks| S3[[Almacenamiento S3 / MinIO]]
        Worker -->|Descarga / Modifica / Sube| S3
        Worker -->|Query Estado Final| Supabase
    end

    style RedPrivadaDocker fill:#f9f,stroke:#333,stroke-width:2px
    style InfraestructuraCloudExterna fill:#bbf,stroke:#333,stroke-width:2px

```

### B. Ciclo de Vida del Procesamiento (Flujo de Secuencia Asíncrono)

Para evitar la congelación del hilo de eventos (*Event Loop*) en Node/Bun ante la manipulación de archivos pesados, todo proceso de transformación de PDFs se maneja de forma puramente asíncrona mediante el siguiente patrón de mensajería:

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario (Navegador)
    participant F as Frontend (Next.js)
    participant G as Gateway (NestJS + Bun)
    participant S as Object Storage (S3)
    participant Q as Event Queue (RabbitMQ)
    participant W as Worker (FastAPI)
    participant DB as Supabase DB

    U->>F: Selecciona archivo PDF a procesar
    F->>G: Sube archivo en Chunks (Stream segmentado)
    G->>S: Almacena binario original de forma segura
    G->>DB: Registra metadatos de Tarea (Estado: PENDING)
    G->>Q: Publica Evento: 'pdf.task.requested' (ID_Tarea + URL_S3)
    G-->>F: Retorna HTTP 202 (Aceptado / Tracking ID)
    F-->>U: Muestra pantalla de carga "Procesando..."
    
    Q->>W: Consume mensaje de la cola de manera asíncrona
    W->>DB: Actualiza Tarea (Estado: PROCESSING)
    W->>S: Descarga binario temporal
    W->>W: Manipulación pesada (PyMuPDF / Pandas / Pillow)
    W->>S: Sube nuevo archivo transformado / optimizado
    W->>DB: Actualiza Tarea (Estado: COMPLETED + URL_Output)
    
    Note over F,G: El frontend realiza sondeo (Polling) o escucha vía WebSockets
    G->>F: Envía actualización de estado (COMPLETED)
    F->>U: Habilita botón y descarga automática del PDF final

```

### C. Implementación Interna: Arquitectura Hexagonal (Ports & Adapters)

Tanto `api-gateway` como `worker-processor` desacoplan rigurosamente sus reglas de negocio de los frameworks tecnológicos para asegurar mantenibilidad a largo plazo y facilitar pruebas unitarias.

```mermaid
graph LR
    subgraph INFRASTRUCTURE [Capa de Infraestructura / Adaptadores]
        Controllers[Controladores HTTP NestJS / FastAPI]
        ORMs[Prisma Client / SQLModel]
        Libs[Librerías Externas: PyMuPDF / Pandas]
        Brokers[Clientes de RabbitMQ / aio-pika]
    end

    subgraph APPLICATION [Capa de Aplicación / Casos de Uso]
        UC1[CompressPdfUseCase]
        UC2[MergePdfUseCase]
        UC3[AuthenticateUserUseCase]
    end

    subgraph DOMAIN [Capa de Dominio / Núcleo Puro]
        Entities[Entidades de Negocio]
        Ports[Interfaces de Puertos / Contratos]
    end

    Controllers -->|Invoca| UC1
    Brokers -->|Despacha a| UC2
    
    UC1 -->|Orquesta con| Entities
    UC1 -->|Interactúa mediante| Ports
    
    ORMs -.->|Implementa contractualmente| Ports
    Libs -.->|Satisface el puerto de| Ports
    Brokers -.->|Satisface el puerto de| Ports

    style DOMAIN fill:#ff9,stroke:#333,stroke-width:2px
    style APPLICATION fill:#9f9,stroke:#333,stroke-width:2px
    style INFRASTRUCTURE fill:#9ff,stroke:#333,stroke-width:2px
```

---

## 🗂️ 2. Estructura del Repositorio (Monorepo)

```text
CORPOSALUD-WEBTOOLS/
├── .env.example                     # Variables para la infraestructura base (Docker)
├── docker-compose.yml               # Orquestación de contenedores locales
├── apps/
│   ├── api-gateway/                 # NESTJS + BUN (API Gateway & Autenticación)
│   │   ├── prisma/
│   │   │   └── schema.prisma        # Definición del modelo relacional de usuarios
│   │   ├── src/                     # Estructura Hexagonal (Domain, Application, Infra)
│   │   ├── .env.example             # Variables requeridas por NestJS
│   │   └── Dockerfile               # Build optimizado Multi-Stage con Bun
│   │
│   ├── worker-processor/            # FASTAPI + PYTHON 3.11 (Motor de conversión de PDFs)
│   │   ├── app/                     # Lógica interna del motor Python (Domain, Application, Infra)
│   │   ├── .env.example             # Variables requeridas por FastAPI
│   │   ├── requirements.txt         # Dependencias críticas (PyMuPDF, Pandas, aio-pika)
│   │   └── Dockerfile               # Build optimizado sobre Python-Slim
│   │
│   └── frontend/                    # NEXT.JS 14 (App Router + TailwindCSS)
│       ├── src/
│       ├── .env.example             # Endpoints públicos y variables de UI
│       └── Dockerfile               # Construcción Standalone basada en Node-Alpine

```

---

## 🔐 3. Matriz Descentralizada de Variables de Entorno (.env)

Para evitar fugas de información confidencial en el ámbito laboral, el proyecto maneja de manera rigurosa **cuatro contextos aislados de variables de entorno**. Copia los `.env.example` y renómbralos a `.env` en cada ubicación:

### Contexto A: Raíz (`./.env`) - Orquestación de Contenedores

```bash
RABBITMQ_USER=mi_usuario_seguro
RABBITMQ_PASS=mi_password_seguro
DATABASE_URL=postgresql://postgres.[ID]:[PASS]@[aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true](https://aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true)
JWT_SECRET=un_hash_corporativo_extremadamente_largo_y_seguro

```

### Contexto B: API Gateway (`./apps/api-gateway/.env`) - Backend Administrativo

```bash
DATABASE_URL=postgresql://postgres.[ID]:[PASS]@[aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true](https://aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true)
RABBITMQ_URL=amqp://mi_usuario_seguro:mi_password_seguro@localhost:5672
JWT_SECRET=un_hash_corporativo_extremadamente_largo_y_seguro

```

### Contexto C: Worker Engine (`./apps/worker-processor/.env`) - Procesamiento

```bash
RABBITMQ_URL=amqp://mi_usuario_seguro:mi_password_seguro@localhost:5672
S3_ENDPOINT=[https://mi-storage.supabase.co/storage/v1/s3](https://mi-storage.supabase.co/storage/v1/s3)
S3_ACCESS_KEY=tu_access_key
S3_SECRET_KEY=tu_secret_key

```

### Contexto D: Frontend (`./apps/frontend/.env`) - Capa de Cliente

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000

```

---

## 🚀 4. Flujo de Trabajo en Desarrollo

### Escenario 1: Ejecución y Pruebas del Ecosistema Completo (Docker)

Si deseas levantar la arquitectura idéntica a producción localmente, asegúrate de tener configurado tu archivo `.env` en la raíz y ejecuta:

```bash
docker-compose up --build

```

### Escenario 2: Programación Aislada de Interfaces (Frontend-Only)

Si solo estás maquetando o programando lógica en la UI de Next.js, no satures tu memoria RAM levantando procesos pesados de bases de datos o Python. Ve directo al grano:

```bash
cd apps/frontend
bun install
bun run dev

```

### Escenario 3: Integración de Datos (Sincronización con Supabase)

Cada vez que realices una alteración o desees empujar la tabla de usuarios hacia el entorno de Supabase desde tu backend con Prisma ORM, ejecuta desde `apps/api-gateway`:

```bash
bun x prisma db push
bun x prisma generate

```

---

## 🛡️ 5. Directrices de Seguridad Corporativa

1. **Validación en Frontera:** El `api-gateway` debe actuar como cortafuegos (*Firewall*). Ningún archivo se transmite a RabbitMQ o S3 sin previa validación rigurosa del tipo MIME y tamaño de archivo en la capa de NestJS.
2. **Manejo de hilos en Python:** Las funciones de transformación pesada ejecutadas por `PyMuPDF` en FastAPI deben correrse delegando el proceso a un hilo secundario (`asyncio` loop running in executor o procesos multiprocessing nativos si se satura el CPU core), evitando degradación de performance en el microservicio.
3. **Principio de Privacidad de Secretos:** Los archivos `.env` reales jamás deben integrarse en los commits de Git. Mantén actualizados estrictamente los archivos `.env.example` ante cualquier nueva variable arquitectónica requerida por el equipo de desarrollo.

