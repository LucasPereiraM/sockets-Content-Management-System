FROM python:3.9

RUN pip install flask flask-cors

COPY  ./ .

EXPOSE 3001

CMD ["python", "server.py"]
