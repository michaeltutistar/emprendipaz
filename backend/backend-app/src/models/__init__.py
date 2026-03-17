from flask_sqlalchemy import SQLAlchemy

# Instancia global de SQLAlchemy
db = SQLAlchemy()

# Importar todos los modelos aquí para evitar importaciones circulares
from .user import User
from .curso import Curso
from .inscripcion import Inscripcion
from .log_actividad import LogActividad
from .modulo import Modulo
from .leccion import Leccion
from .recurso import Recurso 
from .cupos_config import CuposConfig
from .municipio_cupo import MunicipioCupo
from .notificacion import Notificacion
from .curso import Curso
from .usuario_curso import UsuarioCurso
from .activo import Activo
from .usuario_activo import UsuarioActivo
from .evidencia_funcionamiento import EvidenciaFuncionamiento
from .criterio_evaluacion import CriterioEvaluacion
from .evaluacion import Evaluacion
from .sorteo import Sorteo

# Nuevas tablas configurable
from .formulario_campo import FormularioCampo
from .criterio_evaluacion_config import CriterioEvaluacionConfig
from .cupos_municipio_config import CuposMunicipioConfig
from .documento_config import DocumentoConfig
from .intentos_evaluacion import IntentosEvaluacion
from .asistencia_jornada import AsistenciaJornada
from .puntos_plan_negocio import PuntosPlanNegocio
from .respuestas_plan_negocio import RespuestasPlanNegocio
from .support_ticket import SupportTicket, SupportTicketMessage, SupportTicketSatisfaction
from .node_forum import NodeForumThread, NodeForumReply