# use latest python image
FROM python:3.11-slim
# Set the working directory in the container
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# Copy the requirements file to the working directory
COPY requirements.txt .
# Install the Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt
COPY . .

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]