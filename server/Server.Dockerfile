FROM python:3.9

RUN pip install flask flask-cors

COPY  ./ .

EXPOSE 65005

CMD ["python", "server.py"]
