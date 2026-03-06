FROM python:3.10-slim

# Instalacija paketa za slike
RUN apt-get update && apt-get install -y \
    libpng-dev libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Port 7860 je obavezan za HF Spaces
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]