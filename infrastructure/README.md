# **Aptiverse Terraform Infrastructure**

## **🌍 Project Vision: Holistic Student Success Platform**

Aptiverse is an AI-powered platform designed to support South African Grade 11 & 12 students through their final school years. Our mission is to move students from a mindset of "I am not enough" to "I am capable and growing," focusing on holistic development that combines academic preparation with mental health support and future planning.

### **Core Philosophy: From Toxic to Empowering**
We believe in creating an educational environment that:
- **Demystifies** university applications and bursaries
- **Addresses** systemic educational challenges
- **Prioritizes** mental health and well-being
- **Fosters** collaborative, peer-to-peer learning
- **Prepares** students for real-world success

## **🏗️ Infrastructure Overview**

This Terraform project deploys a secure, scalable AWS infrastructure supporting all Aptiverse platform components across multiple environments (dev, staging, prod).

### **Key Infrastructure Components**

1. **Networking**: Multi-AZ VPC with public and private subnets
2. **Compute**: Auto-scaling EC2 instances with Docker support
3. **Database**: Secure RDS PostgreSQL with encryption and backups
4. **Load Balancing**: Application Load Balancer with HTTPS support
5. **Security**: Comprehensive security groups and IAM roles
6. **Storage**: Encrypted volumes and S3 integration

## **📁 Project Structure**

```
aptiverse-terraform/
├── environments/          # Environment-specific configurations
│   ├── dev/              # Development environment (t3.micro, single AZ)
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   ├── staging/          # Staging environment (t3.small, multi-AZ)
│   └── prod/             # Production environment (t3.medium, multi-AZ with backups)
│
├── modules/              # Reusable Terraform modules
│   ├── vpc/              # VPC, subnets, route tables, NAT gateways
│   ├── ec2/              # Auto-scaling groups, launch templates
│   ├── alb/              # Application Load Balancer, target groups
│   ├── rds/              # PostgreSQL RDS with encryption
│   ├── security-groups/  # Security group definitions
│   └── iam/              # IAM roles and policies
│
├── backend.tf           # S3 backend configuration for state management
├── providers.tf         # AWS provider and version configuration
└── versions.tf          # Terraform version requirements
```

## **🚀 Getting Started**

### **Prerequisites**

1. **AWS Account** with appropriate permissions
2. **Terraform** (>= 1.0.0) installed
3. **AWS CLI** configured with credentials
4. **SSH Key Pair** created in AWS for EC2 access

### **Initial Setup**

```bash
# Clone repository
git clone https://github.com/7irelo/aptiverse-terraform
cd aptiverse-terraform

# Configure AWS credentials
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"

# Navigate to environment
cd environments/dev

# Initialize Terraform
terraform init

# Review plan
terraform plan -var-file="terraform.tfvars"

# Apply configuration
terraform apply -var-file="terraform.tfvars"
```

### **Environment Variables**

Create a `.env` file or set environment variables:

```bash
# Database credentials (use secrets manager in production)
export TF_VAR_db_password="secure-password-here"
export TF_VAR_account_id="123456789012"

# Other sensitive variables
export TF_VAR_certificate_arn="arn:aws:acm:..."
```

## **🔧 Module Details**

### **1. VPC Module (`modules/vpc/`)**
Creates a complete networking foundation:
- VPC with public and private subnets across multiple AZs
- Internet Gateway for public access
- NAT Gateways for private subnet internet access
- Route tables and associations

**Key Features:**
- Multi-AZ deployment for high availability
- Isolated private subnets for database and application servers
- Security group-based network segmentation

### **2. EC2 Module (`modules/ec2/`)**
Deploys scalable compute infrastructure:
- Auto-scaling groups with health checks
- Launch templates with Docker and Docker Compose
- User data script for application deployment
- Encrypted EBS volumes

**Application Deployment:**
- Pre-installs Docker and Docker Compose
- Creates systemd service for automatic startup
- Configures Docker Compose with environment variables
- Supports offline functionality for data-light users

### **3. RDS Module (`modules/rds/`)**
Sets up secure PostgreSQL database:
- Multi-AZ deployment (production)
- Encrypted storage at rest
- Automated backups and maintenance windows
- CloudWatch logging and Performance Insights
- Secrets stored in AWS SSM Parameter Store

### **4. Security Module (`modules/security-groups/`)**
Implements defense-in-depth security:
- ALB security group (ports 80/443 from internet)
- Web server security group (port 3000 from ALB only)
- RDS security group (port 5432 from web servers only)
- Bastion host security group (SSH access)

### **5. ALB Module (`modules/alb/`)**
Configures load balancing:
- Application Load Balancer with HTTP/HTTPS listeners
- HTTPS redirection from HTTP
- Health checks on `/health` endpoint
- SSL certificate support

### **6. IAM Module (`modules/iam/`)**
Manages permissions:
- EC2 instance role with SSM, S3, and CloudWatch permissions
- Custom policies for ECR and Secrets Manager access
- Instance profiles for application access

## **🌐 Application Architecture**

### **Data Flow**
```
User → CloudFront (optional) → ALB → Web Servers (EC2) → RDS Database
                                   ↘ S3 (static assets)
                                   ↘ Redis (caching - future)
                                   ↘ Elasticsearch (search - future)
```

### **Feature Support Infrastructure**
1. **AI Models**: EC2 instances with GPU support (future)
2. **File Storage**: S3 buckets for practice tests and resources
3. **Caching**: ElastiCache Redis (future implementation)
4. **Search**: OpenSearch for content discovery (future)
5. **Email/SMS**: SES and SNS for notifications (future)

## **🔐 Security Considerations**

### **Encryption**
- **At Rest**: RDS storage encryption, EBS encryption
- **In Transit**: TLS 1.2+ for ALB, database connections
- **Secrets**: AWS SSM Parameter Store for credentials

### **Access Control**
- Principle of least privilege for IAM roles
- Security groups with minimal required ports
- Private subnets for sensitive components
- Bastion host for SSH access (optional)

### **Compliance**
- Regular security patching via AMI updates
- CloudTrail logging enabled
- VPC Flow Logs for network monitoring
- Regular backup and disaster recovery testing

## **📈 Scalability**

### **Vertical Scaling**
- Environment-specific instance sizes:
  - **Dev**: t3.micro (1-2 instances)
  - **Staging**: t3.small (2-4 instances)
  - **Production**: t3.medium (3-6 instances, auto-scaling)

### **Horizontal Scaling**
- Auto-scaling groups based on CPU/memory metrics
- Load balancer distributes traffic evenly
- Read replicas for database (future)

### **Database Scaling**
- Multi-AZ deployment for high availability
- Provisioned IOPS for performance
- Read replicas for heavy read workloads (future)
- Connection pooling at application level

## **💾 Data Management**

### **Backup Strategy**
- **RDS**: Automated daily snapshots, 7-30 day retention
- **Application Data**: Regular EBS snapshots
- **Configuration**: Terraform state in S3 with versioning
- **Disaster Recovery**: Multi-region replication (future)

### **Monitoring & Logging**
- CloudWatch Metrics for all resources
- CloudWatch Logs for application and database
- Performance Insights for RDS
- Custom metrics for business KPIs

## **🔄 Deployment Workflow**

### **Development Environment**
```bash
# Make changes to modules
cd modules/ec2
# Update configuration

# Test in dev
cd ../../environments/dev
terraform plan
terraform apply -auto-approve

# Validate changes
curl https://dev-aptiverse-alb-url/health
```

### **Promotion to Staging/Production**
1. **Version modules** using Git tags
2. **Update environment** to use new module version
3. **Run terraform plan** to review changes
4. **Apply during maintenance window**
5. **Run smoke tests** and monitor metrics

### **CI/CD Integration** (Recommended)
```yaml
# Example GitHub Actions workflow
name: Terraform
on:
  push:
    branches: [main]
jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: hashicorp/setup-terraform@v1
      - run: terraform init
      - run: terraform plan
      - run: terraform apply -auto-approve
```

## **🔍 Monitoring & Alerting**

### **Key Metrics to Monitor**
1. **Application**: Response time, error rate, active users
2. **Infrastructure**: CPU utilization, memory usage, disk I/O
3. **Database**: Connection count, query performance, storage
4. **Business**: Practice tests completed, goals achieved, user engagement

### **Alert Configuration**
- High CPU utilization (>80%)
- Low disk space (<20% free)
- Database connection limits (>80%)
- Application error rate (>1%)
- Health check failures

## **🛡️ Disaster Recovery**

### **Recovery Time Objective (RTO)**
- **Development**: 24 hours
- **Staging**: 12 hours
- **Production**: 4 hours

### **Recovery Point Objective (RPO)**
- **Development**: 24 hours
- **Staging**: 6 hours
- **Production**: 15 minutes

### **Recovery Procedures**
1. **Database Failure**: Restore from latest snapshot
2. **Application Failure**: Redeploy from AMI
3. **AZ Failure**: Failover to secondary AZ
4. **Region Failure**: Manual failover to secondary region (future)

## **💰 Cost Optimization**

### **Development Environment**
- Use t3.micro instances
- Single-AZ deployment
- Disable multi-AZ for RDS
- Minimal backup retention (7 days)

### **Production Environment**
- Reserved Instances for predictable workloads
- Auto-scaling to match demand patterns
- S3 lifecycle policies for old data
- CloudWatch alarms for cost anomalies

### **Estimated Monthly Costs**
- **Development**: $50-100/month
- **Staging**: $200-400/month
- **Production**: $500-2000/month (scales with users)

## **🎯 Platform Features Supported**

### **Academic Features**
- **AI-Powered Goal Setting**: EC2 instances running ML models
- **Practice Tests**: S3 storage for test content
- **Progress Tracking**: Database analytics and reporting
- **Rubric-Based Assessment**: Automated scoring algorithms

### **Well-being Features**
- **Student Diary**: Secure database storage
- **Psychologist Chat**: Real-time messaging infrastructure
- **Stress Detection**: AI analysis of diary entries
- **Break Reminders**: Scheduled notification system

### **Future Planning**
- **University Navigator**: Content delivery system
- **Bursary Database**: Integration-ready architecture
- **Career Guidance**: Scalable recommendation engine
- **Financial Literacy**: Modular content delivery

### **Collaboration Features**
- **Study Groups**: Real-time communication infrastructure
- **Teacher Dashboard**: Analytics and reporting tools
- **Parent Portal**: Secure family access
- **Tutor Marketplace**: Payment processing ready

## **🌱 Future Enhancements**

### **Infrastructure Roadmap**
1. **Phase 1**: Current deployment (MVP)
2. **Phase 2**: Add Redis caching, CDN, WAF
3. **Phase 3**: Multi-region deployment, disaster recovery
4. **Phase 4**: Kubernetes migration, service mesh

### **Feature Expansion**
1. **Mobile App**: API gateway for mobile clients
2. **Offline Mode**: Local database sync
3. **Video Content**: Media server integration
4. **Analytics**: Data warehouse and BI tools

## **🤝 Contributing**

### **Development Guidelines**
1. **Module Development**: Create reusable, parameterized modules
2. **Testing**: Use terratest for infrastructure validation
3. **Documentation**: Update README for all changes
4. **Security**: Follow least privilege principle

### **Code Review Process**
1. **Plan Review**: `terraform plan` output
2. **Security Review**: IAM policies, security groups
3. **Cost Review**: Resource sizing and configuration
4. **Performance Review**: Database and network setup

## **📚 Resources**

### **Documentation**
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)

### **Training**
- [HashiCorp Learn](https://learn.hashicorp.com/terraform)
- [AWS Training](https://aws.amazon.com/training/)
- [Terraform Certification](https://www.hashicorp.com/certification/terraform-associate)

## **🆘 Support**

### **Common Issues**
1. **State Locking**: Check DynamoDB table
2. **Permission Errors**: Verify IAM roles
3. **Resource Limits**: Check AWS service quotas
4. **Network Issues**: Verify security groups and NACLs

### **Getting Help**
1. **Internal**: Team Slack channel
2. **Technical**: AWS Support
3. **Community**: Terraform forums
4. **Emergency**: On-call rotation schedule

---

## **📞 Contact & Support**

For infrastructure support:
- **Platform Team**: platform@aptiverse.co.za
- **Emergency**: +27 XXX XXX XXXX
- **Documentation**: https://docs.aptiverse.co.za

For platform features:
- **Product Team**: product@aptiverse.co.za
- **Student Support**: help@aptiverse.co.za
- **Schools**: schools@aptiverse.co.za

---

**Empowering South Africa's students for a brighter future, one goal at a time.** 🎓✨
