# Script para crear RDS PostgreSQL en AWS
# Ejecutar en AWS CLI

# 1. Crear Security Group para RDS
aws ec2 create-security-group --group-name elearning-rds-sg --description \
Security
group
for
E-Learning
RDS\

# 2. Autorizar trafico en el puerto 5432
aws ec2 authorize-security-group-ingress --group-name elearning-rds-sg --protocol tcp --port 5432 --cidr 0.0.0.0/0

# 3. Crear instancia RDS PostgreSQL
aws rds create-db-instance --db-instance-identifier elearning-db --db-instance-class db.t3.small --engine postgres --master-username elearning_user --master-user-password Elearning2024! --allocated-storage 20 --vpc-security-group-ids \ --db-name elearning_narino --backup-retention-period 7 --storage-encrypted --storage-type gp2
