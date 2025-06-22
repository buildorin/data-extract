FROM python:3.10-slim

WORKDIR /app

# Install system dependencies (add more as needed)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy OCR service code (update this as needed for your project structure)
COPY services/ocr/ .

# Install Python dependencies if requirements.txt exists
RUN if [ -f requirements.txt ]; then pip install --no-cache-dir -r requirements.txt; fi

EXPOSE 8000
CMD ["python", "main.py"] 