FROM python:3.9-slim

COPY  ./ .

RUN pip install flask flask-cors

CMD ["python", "proxy.py"]
