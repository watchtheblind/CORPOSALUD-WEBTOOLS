Plataforma de alta disponibilidad para el procesamiento, manipulación y gestión segura de documentos digitales, diseñada bajo arquitectura hexagonal y microservicios.

### Estructura de Carpetas (Monorepo)

```text
CORPOSALUD-WEBTOOLS/
├── apps/
│   ├── api-gateway/                 # NESTJS (Entrypoint, Auth, Orquestación)
│   │   ├── src/
│   │   │   ├── core/                # DOMINIO y APLICACIÓN (Hexagonal)
│   │   │   │   ├── domain/          # Entidades, Interfaces/Puertos
│   │   │   │   └── application/     # Casos de uso (ej: registrar-usuario.usecase.ts)
│   │   │   └── infrastructure/      # ADAPTADORES (Controladores, TypeORM, RabbitMQ)
│   │   │       ├── controllers/     # HTTP/REST Endpoints
│   │   │       └── adapters/        # Implementación de bases de datos y colas
│   │   └── main.ts
│   │
│   ├── worker-processor/            # FASTAPI (Procesamiento pesado de PDFs)
│   │   ├── app/
│   │   │   ├── domain/              # Modelos puros de PDF (ej: documento.py)
│   │   │   ├── application/         # Casos de uso (ej: comprimir_pdf.py, combinar_pdf.py)
│   │   │   └── infrastructure/      # Adaptadores (FastAPI, PyMuPDF, S3, RabbitMQ)
│   │   │       ├── api/             # Endpoints (si se necesitan)
│   │   │       └── processors/      # El código que manipula los archivos pesados
│   │   └── main.py
│   │
│   └── frontend/                    # NEXTJS (Interfaz de usuario)
│       ├── src/
│       │   ├── app/                 # Next.js App Router
│       │   ├── components/          # UI Components
│       │   └── services/            # Clientes API para conectar con el Gateway
│
├── docker-compose.yml               # Levanta Redis, RabbitMQ y PostgreSQL
└── README.md                        # Documentación principal

```

---

# CORPOSALUD WebTools - Plataforma Documental Enterprise

Plataforma de alta disponibilidad para el procesamiento, manipulación y gestión segura de documentos digitales (tipo iLovePDF). Diseñada bajo los principios de **Arquitectura Hexagonal**, desacoplamiento por **Microservicios** y comunicación asíncrona mediante eventos.

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (App Router) | Interfaz de usuario optimizada, SSR y carga de archivos en chunks. |
| **API Gateway** | NestJS (TypeScript) | Autenticación (JWT), Guardia de seguridad, Rate Limiting y DTOs de validación. |
| **Processing Engine** | FastAPI (Python 3.11+) | Motor de procesamiento pesado (Conversión, compresión, OCR) usando hilos nativos. |
| **Mensajería / Colas**| RabbitMQ / Redis | Gestión de tareas asíncronas para evitar bloqueos HTTP. |
| **Persistencia** | PostgreSQL | Almacenamiento de usuarios, logs de auditoría y estados de archivos. |
| **Infraestructura** | Docker & Kubernetes | Containerización de microservicios para escalabilidad independiente. |

---

## 📐 Flujo de Arquitectura y Seguridad

Para garantizar un entorno seguro y de alto rendimiento en el ámbito laboral, el sistema opera bajo un flujo **Asíncrono Dirigido por Eventos**:

1. **Validación (Gateway - NestJS):** El usuario sube un archivo. NestJS valida el tamaño, tipo MIME, escanea en busca de malware y verifica los permisos/roles del usuario.
2. **Persistencia Temporal:** El archivo se almacena de forma segura en un almacenamiento de objetos (S3 / MinIO) y NestJS registra la tarea en la base de datos con estado `PENDING`.
3. **Cola de Mensajes:** NestJS publica un evento en **RabbitMQ** (ej: `pdf.compress.requested`) con el ID del archivo.
4. **Procesamiento Pesado (Worker - FastAPI):** El worker de Python consume el mensaje, descarga el archivo, ejecuta la lógica pesada (usando herramientas eficientes de Python) y guarda el resultado.
5. **Notificación:** FastAPI actualiza el estado a `COMPLETED` y notifica al Gateway para que el usuario pueda descargar su archivo mediante Next.js.

---

## 🏗️ Implementación de Arquitectura Hexagonal

Cada microservicio (`api-gateway` y `worker-processor`) está estructurado internamente para separar las reglas de negocio de la tecnología:

* **Domain (Núcleo):** Contiene las entidades puras del negocio y las interfaces de los puertos. No depende de NestJS, FastAPI, bases de datos ni librerías de terceros.
* **Application (Casos de Uso):** Orquesta las acciones del sistema (ej: `CompressPdfUseCase`). Llama a los puertos del dominio.
* **Infrastructure (Adaptadores):** Implementación técnica externa. Aquí residen los controladores HTTP, los modelos de base de datos (TypeORM / SQLModel) y las librerías de manipulación de archivos (`PyMuPDF`, etc.).

---

## 🚀 Inicio Rápido (Desarrollo)

Asegúrate de tener instalado **Docker** y **Docker Compose**.

1. Clona el repositorio:
```bash
   git clone [https://github.com/watchtheblind/CORPOSALUD-WEBTOOLS.git](https://github.com/watchtheblind/CORPOSALUD-WEBTOOLS.git)
   cd CORPOSALUD-WEBTOOLS

```

2. Levanta la infraestructura base (Base de datos, Colas, Caché):

```bash
   docker-compose up -d

```

3. Instala dependencias y corre en modo desarrollo cada app en terminales separadas (o configura tus contenedores de desarrollo).


