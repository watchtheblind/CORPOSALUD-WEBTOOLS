FROM python:3.11-slim
WORKDIR /app

# Instalar dependencias de sistema necesarias para Pandas/PyMuPDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copiar el código del worker
COPY ./app ./app
COPY main.py .

# El worker no necesita exponer puertos (consume de RabbitMQ)
CMD ["python", "main.py"]