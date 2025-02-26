# Use a Python slim version as the base image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the main.py file
COPY *.py .

# Run the application
CMD ["python", "main.py"]
