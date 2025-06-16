import requests
import time
import os
from pathlib import Path

# Configuration
API_BASE = "http://localhost:8000"
TEST_IMAGE = "test_data/sample.png"  # Replace with your test image path

def test_health():
    """Test the health endpoint"""
    response = requests.get(f"{API_BASE}/health")
    assert response.status_code == 200
    print("✅ Health check passed")

def test_document_upload():
    """Test document upload and processing"""
    if not os.path.exists(TEST_IMAGE):
        print(f"❌ Test image not found at {TEST_IMAGE}")
        return

    # Upload document
    with open(TEST_IMAGE, "rb") as f:
        files = {"file": f}
        response = requests.post(f"{API_BASE}/api/documents/upload", files=files)
        assert response.status_code == 200
        data = response.json()
        document_id = data["document_id"]
        print("✅ Document upload successful")

    # Wait for processing
    print("Waiting for document processing...")
    time.sleep(5)

    # Check status
    response = requests.get(f"{API_BASE}/api/documents/{document_id}/status")
    assert response.status_code == 200
    status = response.json()["status"]
    print(f"✅ Document status: {status}")

    # Get results
    response = requests.get(f"{API_BASE}/api/documents/{document_id}/results")
    assert response.status_code == 200
    results = response.json()
    print("✅ Results retrieved successfully")
    print(f"Found {len(results.get('segments', []))} segments")
    print(f"Found {len(results.get('ocr_results', []))} OCR results")

def test_segmentation():
    """Test the segmentation service"""
    if not os.path.exists(TEST_IMAGE):
        print(f"❌ Test image not found at {TEST_IMAGE}")
        return

    with open(TEST_IMAGE, "rb") as f:
        files = {"image": f}
        response = requests.post("http://localhost:8001/segmentation/process", files=files)
        assert response.status_code == 200
        data = response.json()
        print(f"✅ Segmentation successful: found {len(data['segments'])} segments")

def test_ocr():
    """Test the OCR service"""
    if not os.path.exists(TEST_IMAGE):
        print(f"❌ Test image not found at {TEST_IMAGE}")
        return

    with open(TEST_IMAGE, "rb") as f:
        files = {"image": f}
        response = requests.post("http://localhost:8002/ocr/extract", files=files)
        assert response.status_code == 200
        data = response.json()
        print(f"✅ OCR successful: extracted {len(data['words'])} words")
        print(f"Text: {data['text'][:100]}...")

def main():
    """Run all tests"""
    print("Starting API tests...")
    
    try:
        test_health()
        test_document_upload()
        test_segmentation()
        test_ocr()
        print("\n✨ All tests completed successfully!")
    except AssertionError as e:
        print(f"\n❌ Test failed: {str(e)}")
    except requests.exceptions.ConnectionError:
        print("\n❌ Could not connect to the services. Make sure they are running.")
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")

if __name__ == "__main__":
    main() 