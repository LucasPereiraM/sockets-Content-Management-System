FROM python:3.9-slim

COPY  ./ .

EXPOSE 3001

RUN pip install flask flask-cors

CMD ["python", "proxy.py"]
