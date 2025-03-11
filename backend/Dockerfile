# Use a base image with Python
FROM python:3

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the app's port
EXPOSE 8080

# Use Gunicorn to run the Flask app
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8080"]