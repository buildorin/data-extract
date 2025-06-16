# API Documentation

## Base URL
```
https://app.useorin.com/api
```

## Authentication
All API endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Document Processing

#### Upload Document
```http
POST /api/documents/upload
Content-Type: multipart/form-data

Parameters:
- file: Document file (PDF, Image)
- type: Document type (optional)

Response:
{
    "document_id": "string",
    "status": "processing",
    "message": "Document uploaded successfully"
}
```

#### Get Document Status
```http
GET /api/documents/{document_id}/status

Response:
{
    "document_id": "string",
    "status": "completed|processing|failed",
    "progress": number,
    "error": "string" (if status is failed)
}
```

#### Get Document Results
```http
GET /api/documents/{document_id}/results

Response:
{
    "document_id": "string",
    "status": "completed",
    "segments": [
        {
            "id": "string",
            "text": "string",
            "confidence": number,
            "bounding_box": {
                "x1": number,
                "y1": number,
                "x2": number,
                "y2": number
            }
        }
    ],
    "ocr_results": [
        {
            "text": "string",
            "confidence": number,
            "position": {
                "x": number,
                "y": number
            }
        }
    ]
}
```

### 2. Segmentation API

#### Process Image
```http
POST /segmentation/process
Content-Type: multipart/form-data

Parameters:
- image: Image file
- options: JSON string (optional)
  {
    "threshold": number,
    "min_size": number
  }

Response:
{
    "segments": [
        {
            "id": "string",
            "confidence": number,
            "bounding_box": {
                "x1": number,
                "y1": number,
                "x2": number,
                "y2": number
            }
        }
    ]
}
```

### 3. OCR API

#### Extract Text
```http
POST /ocr/extract
Content-Type: multipart/form-data

Parameters:
- image: Image file
- language: string (optional, default: "en")

Response:
{
    "text": "string",
    "confidence": number,
    "words": [
        {
            "text": "string",
            "confidence": number,
            "position": {
                "x": number,
                "y": number
            }
        }
    ]
}
```

## Error Responses
All endpoints may return the following error responses:

```json
{
    "error": {
        "code": "string",
        "message": "string",
        "details": object (optional)
    }
}
```

Common error codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limits
- Standard tier: 100 requests per minute
- Premium tier: 1000 requests per minute

## Examples

### cURL Example
```bash
# Upload a document
curl -X POST https://app.useorin.com/api/documents/upload \
  -H "Authorization: Bearer <your-token>" \
  -F "file=@document.pdf"

# Get document results
curl -X GET https://app.useorin.com/api/documents/<document_id>/results \
  -H "Authorization: Bearer <your-token>"
```

### Python Example
```python
import requests

API_BASE = "https://app.useorin.com/api"
TOKEN = "<your-token>"

headers = {
    "Authorization": f"Bearer {TOKEN}"
}

# Upload document
with open("document.pdf", "rb") as f:
    files = {"file": f}
    response = requests.post(f"{API_BASE}/documents/upload", 
                           headers=headers, 
                           files=files)
    document_id = response.json()["document_id"]

# Get results
results = requests.get(f"{API_BASE}/documents/{document_id}/results", 
                      headers=headers).json() 