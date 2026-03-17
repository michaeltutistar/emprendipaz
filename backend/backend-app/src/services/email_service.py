"""
Servicio de envío de emails vía SMTP (Gmail).
Usa variables de entorno: EMAIL_SENDER, EMAIL_APP_PASSWORD, FRONTEND_URL
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_password_reset_email(to_email: str, reset_token: str, user_name: str = None) -> bool:
    """
    Envía email con link para recuperar contraseña.
    Returns True si se envió correctamente, False en caso contrario.
    """
    sender = os.getenv('EMAIL_SENDER', 'elearningnarino@gmail.com')
    app_password = os.getenv('EMAIL_APP_PASSWORD')
    frontend_url = os.getenv('FRONTEND_URL', 'https://emprendimiento-narino.com')

    if not app_password:
        print("[email_service] EMAIL_APP_PASSWORD no configurada - no se envía email")
        return False

    reset_link = f"{frontend_url.rstrip('/')}/reset-password?token={reset_token}"
    nombre = (user_name or '').strip() or 'Usuario'

    subject = "Recuperación de contraseña - Plataforma EmprendiPaz"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #15803d;">Recuperación de contraseña</h2>
        <p>Hola {nombre},</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en la Plataforma EmprendiPaz.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p style="margin: 20px 0;">
            <a href="{reset_link}" style="background-color: #15803d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Restablecer contraseña
            </a>
        </p>
        <p style="font-size: 12px; color: #666;">
            Si no solicitaste este cambio, puedes ignorar este correo. El enlace expira en 1 hora.
        </p>
        <p style="font-size: 12px; color: #666;">
            Si el botón no funciona, copia y pega este enlace en tu navegador:<br/>
            <a href="{reset_link}">{reset_link}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 11px; color: #999;">
            Plataforma E-Learning - Gobernación de Nariño
        </p>
    </body>
    </html>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = sender
    msg['To'] = to_email
    msg.attach(MIMEText(html_body, 'html'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(sender, app_password)
            server.sendmail(sender, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[email_service] Error enviando email a {to_email}: {e}")
        return False
