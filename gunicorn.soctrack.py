bind = "Insert your own values here"
wsgi_app = "main:app"
workers = 1
worker_class = "uvicorn.workers.UvicornWorker"
errorlog = 'soctrack.error.log'
accesslog = 'soctrack.access.log'
loglevel = 'debug'
timeout = 30
