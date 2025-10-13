import json

# import serverless_wsgi
# from src.main import app

def lambda_handler(event, context):
    # This is a simple diagnostic function to test if the Lambda handler itself is working.
    # It bypasses Flask and serverless-wsgi entirely.
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'message': 'Hello from Lambda! The handler is working.'})
    }

# def lambda_handler_original(event, context):
#     return serverless_wsgi.handle_request(app, event, context)