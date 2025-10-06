# AWS Lambda + OpenAI Integration

Project AWS Lambda yang mengambil data dari REST API, diproses dengan OpenAI, dan di-trigger menggunakan AWS EventBridge.

## 📋 Fitur

- ✅ Trigger otomatis menggunakan AWS EventBridge (scheduled/event-based)
- ✅ Fetch data dari REST API eksternal
- ✅ Integrasi dengan OpenAI untuk analisis data
- ✅ Error handling yang komprehensif
- ✅ Logging untuk monitoring
- ✅ Environment variables untuk konfigurasi

## 🏗️ Struktur Project

```
lambda/
├── index.js                 # Lambda handler utama
├── package.json             # Dependencies
├── .env.example            # Template environment variables
├── eventbridge-rule.json   # Konfigurasi EventBridge
├── iam-policy.json         # IAM policy untuk Lambda
├── .gitignore              # Git ignore file
└── README.md               # Dokumentasi
```

## 🚀 Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Konfigurasi Environment Variables

Buat file `.env` untuk testing lokal (tidak diperlukan untuk AWS Lambda):

```bash
cp .env.example .env
```

Edit `.env` dan isi dengan credentials Anda:
- `OPENAI_API_KEY`: API key dari OpenAI
- `REST_API_URL`: URL REST API yang ingin dipanggil
- `API_KEY`: (Optional) API key jika REST API memerlukan autentikasi

### 3. Deploy ke AWS Lambda

#### A. Buat Lambda Function

```bash
# Buat ZIP file
zip -r function.zip . -x "*.git*" "node_modules/.bin/*"

# Buat Lambda function (ganti ROLE_ARN dengan IAM role Anda)
aws lambda create-function \
  --function-name lambda-openai-integration \
  --runtime nodejs18.x \
  --role ROLE_ARN \
  --handler index.handler \
  --zip-file fileb://function.zip \
  --timeout 30 \
  --memory-size 256
```

#### B. Set Environment Variables di AWS Lambda

```bash
aws lambda update-function-configuration \
  --function-name lambda-openai-integration \
  --environment "Variables={OPENAI_API_KEY=your_key,REST_API_URL=https://api.example.com,OPENAI_MODEL=gpt-3.5-turbo}"
```

#### C. Buat EventBridge Rule

```bash
# Buat rule (trigger setiap 5 menit)
aws events put-rule \
  --name lambda-openai-trigger \
  --schedule-expression "rate(5 minutes)" \
  --state ENABLED

# Tambahkan Lambda sebagai target
aws events put-targets \
  --rule lambda-openai-trigger \
  --targets "Id"="1","Arn"="arn:aws:lambda:REGION:ACCOUNT_ID:function:lambda-openai-integration"

# Berikan permission ke EventBridge untuk invoke Lambda
aws lambda add-permission \
  --function-name lambda-openai-integration \
  --statement-id AllowEventBridgeInvoke \
  --action lambda:InvokeFunction \
  --principal events.amazonaws.com \
  --source-arn arn:aws:events:REGION:ACCOUNT_ID:rule/lambda-openai-trigger
```

**Catatan:** Ganti `REGION` dan `ACCOUNT_ID` dengan region dan account ID AWS Anda.

### 4. Update Function (setelah perubahan code)

```bash
zip -r function.zip . -x "*.git*" "node_modules/.bin/*"
aws lambda update-function-code \
  --function-name lambda-openai-integration \
  --zip-file fileb://function.zip
```

## 🔧 Konfigurasi

### EventBridge Schedule Expressions

Anda bisa mengubah schedule expression di EventBridge:

- `rate(5 minutes)` - Setiap 5 menit
- `rate(1 hour)` - Setiap 1 jam
- `rate(1 day)` - Setiap 1 hari
- `cron(0 12 * * ? *)` - Setiap hari jam 12:00 UTC
- `cron(0 0 * * MON-FRI *)` - Setiap hari kerja jam 00:00 UTC

### OpenAI Models

Model yang tersedia:
- `gpt-3.5-turbo` (default, lebih murah)
- `gpt-4` (lebih canggih, lebih mahal)
- `gpt-4-turbo-preview`

## 📊 Monitoring & Logs

### Lihat Logs di CloudWatch

```bash
aws logs tail /aws/lambda/lambda-openai-integration --follow
```

### Test Lambda Function

```bash
aws lambda invoke \
  --function-name lambda-openai-integration \
  --payload '{"source":"manual.test","time":"2025-10-06T15:00:00Z"}' \
  response.json

cat response.json
```

## 🔒 Security Best Practices

1. **Jangan commit API keys** ke repository
2. **Gunakan AWS Secrets Manager** untuk menyimpan sensitive data:
   ```bash
   aws secretsmanager create-secret \
     --name openai-api-key \
     --secret-string "your-api-key"
   ```
3. **Gunakan IAM roles** dengan least privilege principle
4. **Enable VPC** jika perlu akses ke private resources
5. **Set timeout** yang sesuai untuk menghindari charges berlebih

## 💰 Cost Optimization

- Sesuaikan memory size (128MB - 10GB)
- Set timeout yang optimal (default: 30s)
- Gunakan EventBridge schedule yang efisien
- Monitor invocation count dan duration
- Gunakan OpenAI model yang sesuai kebutuhan

## 🐛 Troubleshooting

### Error: "OPENAI_API_KEY is not set"
- Pastikan environment variable sudah di-set di Lambda configuration

### Error: "Task timed out after 3.00 seconds"
- Increase timeout di Lambda configuration

### Error: "REST API request failed"
- Cek URL dan network connectivity
- Pastikan Lambda memiliki internet access (jika di VPC, gunakan NAT Gateway)

### Error: "Insufficient permissions"
- Cek IAM role memiliki permissions yang diperlukan

## 📝 Customization

### Mengubah REST API

Edit di `index.js`:
```javascript
const apiUrl = process.env.REST_API_URL || 'https://your-api.com/endpoint';
```

### Mengubah OpenAI Prompt

Edit di `index.js` bagian `messages`:
```javascript
{
  role: 'system',
  content: 'Your custom system prompt here'
}
```

### Menambahkan POST Request

Ganti `axios.get` dengan `axios.post`:
```javascript
const apiResponse = await axios.post(apiUrl, {
  // your payload
}, {
  headers: { ... }
});
```

## 📚 Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [EventBridge Documentation](https://docs.aws.amazon.com/eventbridge/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Axios Documentation](https://axios-http.com/)

## 📄 License

ISC

---

**Dibuat dengan ❤️ untuk AWS Lambda + OpenAI Integration**
