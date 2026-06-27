import serverless_wsgi
from src.main import app


def lambda_handler(event, context):
    """
    AWS Lambda entrypoint.
    Delegates handling to Flask via serverless-wsgi so routes like /api/login work.
    """
    return serverless_wsgi.handle_request(app, event, context)