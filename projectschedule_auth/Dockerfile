FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Using 8001 for this service
EXPOSE 8001

CMD ["python", "manage.py", "runserver", "0.0.0.0:8001"]