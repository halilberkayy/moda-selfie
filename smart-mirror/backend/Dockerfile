FROM python:3.11-slim

# Çıktıların anında görünmesi için
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Sistem paketlerini yükle
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Gereksinim dosyasını kopyala ve paketleri yükle
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyalarını kopyala
COPY . .

# Sağlık kontrolü için
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Geliştirme sırasında --reload; production için kaldırılabilir.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
