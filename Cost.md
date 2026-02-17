# Infrastructure Cost Comparison

**ILHRF Data Collection Platform** — Comparative cloud cost analysis across AWS, GCP, Azure, and Oracle Cloud.

**Document Version:** 1.5
**Last Updated:** February 2026  
**Currency:** USD  
**Region:** US (us-east-1 / us-central1 / East US equivalent)

---

## 1. Workload Assumptions

Based on the [Architecture](Architecture.md), the platform requires:

| Component             | Purpose                               | Tier 1 (Small)          | Tier 2 (Medium)           |
| --------------------- | ------------------------------------- | ----------------------- | ------------------------- |
| **Compute**           | Backend (NestJS) + Frontend (Next.js) | 2 vCPU, 4 GB RAM        | 4 vCPU, 8 GB RAM          |
| **Primary DB**        | YugaByteDB (PostgreSQL-compatible)    | 2 vCPU, 4 GB RAM, 50 GB | 4 vCPU, 16 GB RAM, 100 GB |
| **Redis**             | Cache + BullMQ queue                  | 2 GB                    | 8 GB                      |
| **Blob Storage (S3)** | Audio, video, exports                 | 100 GB                  | 500 GB                    |
| **Time-Series DB**    | Analytics (TimeScaleDB)               | 20 GB                   | 50 GB                     |
| **Load Balancer**     | HTTPS, SSL termination                | 1                       | 1                         |
| **Data Egress**       | Outbound traffic                      | 100 GB/mo               | 500 GB/mo                 |

**Target scale:** Tier 1 ≈ 100–1,000 users; Tier 2 ≈ 5,000–10,000 users.

**Note:** The platform uses YugaByteDB as the primary database. See [Section 2.1](#21-primary-database-yugabytedb-vs-postgresql) for YugaByteDB-specific pricing (managed and self-hosted). The main cost table uses "Primary DB" for compatibility with both YugaByteDB and PostgreSQL.

---

## 2. Monthly Cost Comparison (USD)

| Service           | AWS           | GCP           | Azure         | Oracle        |
| ----------------- | ------------- | ------------- | ------------- | ------------- |
| **Compute**       | $30–45        | $25–40        | $30–45        | $21–35        |
| **Primary DB**    | $37–90        | $35–85        | $25–80        | $30–75        |
| **Redis**         | $30–120       | $35–140       | $75–200       | $0\*          |
| **Blob Storage**  | $2–12         | $2–11         | $2–10         | $3–13         |
| **Time-Series**   | $15–40        | $15–40        | $15–40        | $15–40        |
| **Load Balancer** | $18–25        | $18–25        | $20–28        | $10–20        |
| **Data Egress**   | $9–45         | $8–40         | $9–45         | $1–5          |
| **Tier 1 Total**  | **~$141–377** | **~$138–376** | **~$176–448** | **~$80–188**  |
| **Tier 2 Total**  | **~$280–650** | **~$270–620** | **~$320–720** | **~$150–350** |

\* Oracle does not offer managed Redis; use self-hosted on a VM or third-party.

### 2.1 Primary Database: YugaByteDB vs PostgreSQL

The platform uses **YugaByteDB** (PostgreSQL-compatible). You can deploy it as:

| Option | Tier 1 (2 vCPU, 50 GB) | Tier 2 (4 vCPU, 100 GB) | Notes |
|--------|-------------------------|--------------------------|-------|
| **YugaByteDB Aeon (managed)** | ~$255–595/mo | ~$510–1,225/mo | 3 nodes min, scale to 7. $125/vCPU/mo + $0.10/GB. [Yugabyte pricing](https://www.yugabyte.com/pricing) |
| **YugaByteDB self-hosted (VMs)** | ~$210–360/mo | ~$210–840/mo | 3 nodes min, autoscale to 7. 5+ cores, 15 GB RAM, 100 GB SSD per node. |
| **YugaByteDB on Kubernetes** | ~$80–140/mo | ~$220–520/mo | 3 nodes min, autoscale to 7. [Helm chart](https://charts.yugabyte.com). No licensing cost. See [Section 6.6](#66-yugabytedb-on-kubernetes). |
| **PostgreSQL (managed)** | $37–90/mo | $100–120/mo | RDS, Cloud SQL, Azure PostgreSQL. Compatible alternative. |

**YugaByteDB Aeon (managed):**
- Standard: $125/vCPU/month; Professional: $167/vCPU/month
- Disk storage: $0.10/GB/month; Backup: $0.025/GB/month
- **3 nodes minimum**, scale up to 7+ nodes for higher throughput
- Available on AWS, GCP, Azure via [YugabyteDB Aeon](https://www.yugabyte.com/pricing)

**YugaByteDB self-hosted (VMs):**
- Deploy open-source YugabyteDB on EC2, GCE, or Azure VMs
- Per-node requirements: 5+ cores (8 recommended), 15 GB RAM, 100 GB SSD
- **Minimum 3 nodes** for HA (Raft consensus); **autoscale up to 7 nodes** for higher throughput
- Tier 1 (3 nodes): ~$210–360/mo; Tier 2 (3–7 nodes): ~$210–840/mo depending on scale

**YugaByteDB on Kubernetes:**
- Deploy via Helm (`helm install yugabyte yugabyte/yugabyte`) on EKS, GKE, AKS, or OKE
- No licensing cost; open-source. Cost = node/pod resources + PersistentVolume storage
- **Minimum 3 nodes** (masters/tservers); **autoscale up to 7 nodes** for peak load
- Min cluster: 12 vCPU, 18 GB RAM total (e.g. 3 nodes × 4 vCPU, 6 GB)
- See [Section 6.6](#66-yugabytedb-on-kubernetes) for K8s-specific estimates

---

## 3. Detailed Monthly Cost Charts

### Tier 1 — Small Production (~100–1,000 users)

| Component                         | AWS      | GCP      | Azure    | Oracle   |
| --------------------------------- | -------- | -------- | -------- | -------- |
| Compute (2 vCPU, 4 GB)            | $35      | $30      | $35      | $25      |
| Primary DB (2 vCPU, 50 GB)       | $55      | $50      | $45      | $45      |
| Redis (2 GB)                      | $35      | $40      | $80      | $25\*\*  |
| Blob Storage (100 GB)             | $2.30    | $2.00    | $1.80    | $2.55    |
| TimeScaleDB / Time-series (20 GB) | $25      | $25      | $25      | $25      |
| Load Balancer                     | $22      | $20      | $22      | $15      |
| Data Egress (100 GB)              | $9       | $8       | $9       | $1       |
| **Monthly Total**                 | **$183** | **$175** | **$217** | **$138** |

### Tier 2 — Medium Production (~5,000–10,000 users)

| Component                         | AWS      | GCP      | Azure    | Oracle   |
| --------------------------------- | -------- | -------- | -------- | -------- |
| Compute (4 vCPU, 8 GB)            | $70      | $60      | $70      | $50      |
| Primary DB (4 vCPU, 100 GB)      | $120     | $110     | $100     | $95      |
| Redis (8 GB)                      | $100     | $110     | $160     | $50\*\*  |
| Blob Storage (500 GB)             | $11.50   | $10.00   | $9.00    | $12.75   |
| TimeScaleDB / Time-series (50 GB) | $40      | $40      | $40      | $40      |
| Load Balancer                     | $25      | $23      | $25      | $18      |
| Data Egress (500 GB)              | $45      | $40      | $45      | $5       |
| **Monthly Total**                 | **$412** | **$393** | **$439** | **$279** |

\*\* Oracle: Redis via self-hosted VM or third-party; estimate based on small VM.

---

## 4. Yearly Cost Summary (USD)

| Provider   | Tier 1 (Small) | Tier 2 (Medium) |
| ---------- | -------------- | --------------- |
| **AWS**    | $2,196         | $4,944          |
| **GCP**    | $2,100         | $4,716          |
| **Azure**  | $2,604         | $5,268          |
| **Oracle** | $1,656         | $3,348          |

---

## 5. Cost Charts (Visual Summary)

### Monthly Costs by Provider

```
Tier 1 (Small) — Monthly USD
────────────────────────────────────────────────────────────────
AWS     ████████████████████████████████████████  $183
GCP     ██████████████████████████████████████   $175
Azure   █████████████████████████████████████████████  $217
Oracle  ██████████████████████████████  $138
────────────────────────────────────────────────────────────────

Tier 2 (Medium) — Monthly USD
────────────────────────────────────────────────────────────────
AWS     ████████████████████████████████████████████████████████████████  $412
GCP     ██████████████████████████████████████████████████████████████   $393
Azure   ███████████████████████████████████████████████████████████████████  $439
Oracle  ████████████████████████████████████████████  $279
────────────────────────────────────────────────────────────────
```

### Yearly Costs by Provider

| Provider | Tier 1 (Yearly) | Tier 2 (Yearly) |
| -------- | --------------- | --------------- |
| AWS      | $2,196          | $4,944          |
| GCP      | $2,100          | $4,716          |
| Azure    | $2,604          | $5,268          |
| Oracle   | $1,656          | $3,348          |

---

## 6. Kubernetes Deployment

If you deploy the platform on a managed Kubernetes cluster (EKS, GKE, AKS, OKE), add control-plane and node overhead to the VM-based estimates.

### 6.1 Control Plane Costs

| Provider      | Service | Control Plane        | Notes                                          |
|---------------|---------|----------------------|------------------------------------------------|
| **Azure AKS** | AKS     | **$0**               | No control plane charge                        |
| **AWS**       | EKS     | ~**$73/month**       | $0.10/hour per cluster                         |
| **GCP**       | GKE     | ~**$73/month**       | $0.10/hour (Standard mode)                     |
| **Oracle**    | OKE     | **$0 or ~$74/month** | Free basic tier (no SLA); paid tier ~$74/month |

### 6.2 Worker Nodes (Compute)

Worker nodes replace VM-based compute. Assume ~10–15% overhead for kubelet, system pods, and DaemonSets.

| Tier   | Node Count | Spec per Node    | Approx. Monthly (nodes only) |
|--------|------------|------------------|------------------------------|
| Tier 1 | 2 nodes    | 2 vCPU, 4 GB     | ~$40–70                      |
| Tier 2 | 3–4 nodes  | 2–4 vCPU, 4–8 GB | ~$90–150                     |

### 6.3 Monthly Cost with Kubernetes

| Provider         | Tier 1 (Small)     | Tier 2 (Medium)    |
|------------------|--------------------|--------------------|
| **AWS (EKS)**    | ~$256 (+$73)       | ~$485 (+$73)       |
| **GCP (GKE)**    | ~$248 (+$73)       | ~$466 (+$73)       |
| **Azure (AKS)**  | ~$217 (+$0)        | ~$439 (+$0)        |
| **Oracle (OKE)** | ~$138–212 (+$0–74) | ~$279–353 (+$0–74) |

*Database, Redis, storage, load balancer, and egress costs are unchanged; only compute and control plane differ.*

### 6.4 When Kubernetes Makes Sense

- **Good fit:** Multi-service apps, autoscaling, rolling updates, multi-environment (dev/stage/prod), GitOps.
- **Less ideal:** Single small app, limited ops capacity, tight budget.

### 6.5 Kubernetes Cost Optimization

- **Azure AKS** — No control plane fee; lowest K8s overhead.
- **Oracle OKE basic** — Free control plane (no SLA) for dev/test.
- **Spot / Preemptible nodes** — For non-critical or batch workloads; can cut node cost by ~50–80%.
- **Fargate / serverless nodes** — Pay per pod instead of per node; can be cheaper for low, spiky traffic.

### 6.6 YugaByteDB on Kubernetes

When running the platform on Kubernetes, you can deploy YugaByteDB via the [official Helm chart](https://charts.yugabyte.com). There is **no licensing cost** for the open-source deployment; you pay only for cluster resources (nodes, storage).

**Cluster sizing:**
- **Minimum 3 nodes** (masters/tservers) — required for Raft consensus and HA
- **Autoscale up to 7 nodes** — for higher throughput and read scaling at peak load

**Resource requirements (from [YugabyteDB docs](https://docs.yugabyte.com/stable/deploy/kubernetes/single-zone/oss/helm-chart)):**
- Minimum: 12 vCPU, 18 GB RAM total (e.g. 3 nodes × 4 vCPU, 6 GB each)
- Recommended for production: 3 masters + 3 tservers; 2 vCPU, 4 GB per pod minimum

**Estimated monthly cost (YugaByteDB pods + storage only):**

| Tier | Config | Nodes | Node/Pod Resources | Storage | Approx. Monthly |
|------|--------|-------|--------------------|---------|-----------------|
| **Tier 1** | 3-node cluster (min) | 3 | 6 vCPU, 12 GB RAM | 50 GB PV | ~$80–140 |
| **Tier 2 (min)** | 3 masters + 3 tservers | 3 | 12 vCPU, 24 GB RAM | 100 GB PV | ~$220–380 |
| **Tier 2 (scaled)** | Autoscaled to 7 nodes | 7 | 28 vCPU, 56 GB RAM | 100 GB PV | ~$510–730 |

*Assumes shared or dedicated worker nodes on EKS/GKE/AKS. Add to [Section 6.3](#63-monthly-cost-with-kubernetes) totals. At 7 nodes: Tier 2 K8s (~$485) + YugaByteDB (~$600) ≈ ~$1,085.*

**Cost drivers:**
- **Nodes:** YugaByteDB pods consume CPU/RAM; size nodes for 3–7 node range; use HPA/VPA for autoscaling
- **PersistentVolumes:** ~$0.10/GB/month (cloud block storage)
- **No extra control plane:** YugaByteDB runs as workloads on your existing cluster
- **Autoscaling:** Cost scales with node count; plan for 3-node baseline and 7-node peak

**Alternative:** Use [YugaByteDB Aeon](https://www.yugabyte.com/pricing) (managed) instead of self-hosted on K8s to avoid node sizing and operational overhead.

---

## 7. Provider-Specific Notes

### 7.1 AWS

- **Strengths:** Broad service set, mature managed services, strong S3 and RDS.
- **Considerations:** Data egress can add cost; Reserved Instances/Savings Plans can cut compute by ~30–40%.
- **Services:** EC2, RDS PostgreSQL / YugabyteDB Aeon, ElastiCache Redis, S3, Application Load Balancer.

### 7.2 GCP

- **Strengths:** Competitive pricing, strong data/ML tooling, Cloud Run for variable workloads.
- **Considerations:** Cloud SQL and Memorystore can be pricier at small sizes.
- **Services:** Compute Engine / Cloud Run, Cloud SQL / YugabyteDB Aeon, Memorystore Redis, Cloud Storage, Load Balancing.

### 7.3 Azure

- **Strengths:** Good hybrid integration, PostgreSQL Flexible Server, Azure Cache for Redis.
- **Considerations:** Redis and some services tend to be more expensive at small tiers.
- **Services:** Virtual Machines / App Service, Azure Database for PostgreSQL / YugabyteDB Aeon, Azure Cache for Redis, Blob Storage, Load Balancer.

### 7.4 Oracle Cloud

- **Strengths:** Often lower compute and egress costs; Always Free tier for experimentation.
- **Considerations:** No managed Redis; ecosystem smaller than AWS/GCP/Azure.
- **Services:** Compute (VM.Standard.E2.1), Base Database / Autonomous DB, Object Storage, Load Balancer.

---

## 8. Cost Optimization Tips

1. **Reserved / Committed Use:** 1–3 year commitments can reduce compute by 30–60%.
2. **Spot / Preemptible:** For non-critical or batch workloads, can cut compute by ~50–80%.
3. **Storage Tiers:** Use S3 IA, Glacier, or equivalent for older audio/video to reduce storage cost.
4. **Egress:** Keep traffic in-region; use CDN (CloudFront, Cloud CDN, etc.) for static assets.
5. **Right-Sizing:** Start small and scale up based on real usage.
6. **Oracle Free Tier:** Use Always Free resources for dev/test and early production.

---

## 9. Pricing Sources & Disclaimer

- **AWS:** [AWS Pricing Calculator](https://calculator.aws/), [S3](https://aws.amazon.com/s3/pricing/), [RDS](https://aws.amazon.com/rds/pricing/)
- **GCP:** [Google Cloud Pricing](https://cloud.google.com/products/calculator)
- **Azure:** [Azure Pricing Calculator](https://azure.microsoft.com/pricing/calculator/)
- **Oracle:** [OCI Pricing](https://www.oracle.com/cloud/price-list/)
- **YugaByteDB:** [YugabyteDB Aeon Pricing](https://www.yugabyte.com/pricing), [Cluster costs](https://docs.yugabyte.com/preview/yugabyte-cloud/cloud-admin/cloud-billing-costs)

**Disclaimer:** Prices are indicative and depend on region, usage, and discounts. Use each provider’s calculator for up-to-date estimates before committing.

---

_Built for linguistic diversity and AI research._
