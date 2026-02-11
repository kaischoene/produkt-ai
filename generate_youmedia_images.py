#!/usr/bin/env python3
"""
YouMedia Website Image Generator
=================================
Generates images for the YouMedia agency website using the Nano Banana API
via the ProduktAI backend server.

Usage:
    1. Make sure the backend server is running (python backend/server.py)
    2. Register/login to get an auth token
    3. Run: python generate_youmedia_images.py

The generated images will be saved to frontend/public/images/youmedia/
"""

import requests
import base64
import os
import sys
import time
import json

BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:8001")
API = f"{BACKEND_URL}/api"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "frontend", "public", "images", "youmedia")

# Image prompts for each website section
IMAGE_PROMPTS = [
    {
        "filename": "hero-bg.jpg",
        "prompt": "Modern creative agency workspace in Lucerne Switzerland, dramatic dark moody lighting, minimalist design studio with large monitors showing branding work, lime green accent lighting, professional photography, ultra wide angle, cinematic composition",
        "negative_prompt": "text, watermark, logo, people faces, blurry",
        "width": 1920,
        "height": 1080,
    },
    {
        "filename": "about-founder.jpg",
        "prompt": "Professional male creative director portrait silhouette in modern design studio, dramatic side lighting, wearing dark clothing, standing confidently, blurred studio background with design work visible, cinematic portrait photography",
        "negative_prompt": "face details, specific person, blurry, low quality",
        "width": 1024,
        "height": 1024,
    },
    {
        "filename": "portfolio-branding.jpg",
        "prompt": "Elegant brand identity design mockup, business cards and stationery spread on dark marble surface, minimalist logo design, gold foil details, professional product photography, overhead shot",
        "negative_prompt": "text, blurry, low quality",
        "width": 1024,
        "height": 1024,
    },
    {
        "filename": "portfolio-webdesign.jpg",
        "prompt": "Modern e-commerce website design displayed on MacBook Pro and iPhone, clean UI design, dark theme with lime green accents, professional product photography setup, floating devices mockup",
        "negative_prompt": "text, blurry, low quality, watermark",
        "width": 1024,
        "height": 1024,
    },
    {
        "filename": "portfolio-socialmedia.jpg",
        "prompt": "Creative social media campaign content grid displayed on tablet, Instagram feed layout, colorful and engaging visual content, modern graphic design, professional flat lay photography",
        "negative_prompt": "text, blurry, low quality",
        "width": 1024,
        "height": 1024,
    },
    {
        "filename": "portfolio-photography.jpg",
        "prompt": "Professional corporate photography setup in studio, camera on tripod, dramatic lighting equipment, behind the scenes of a product photoshoot, cinematic atmosphere",
        "negative_prompt": "face, person, blurry, low quality",
        "width": 1024,
        "height": 1024,
    },
    {
        "filename": "portfolio-video.jpg",
        "prompt": "Professional video production set with cinema camera, LED lights, and monitors showing video editing timeline, dark studio atmosphere, cinematic filmmaking equipment",
        "negative_prompt": "text, blurry, low quality, watermark",
        "width": 1024,
        "height": 1024,
    },
    {
        "filename": "portfolio-print.jpg",
        "prompt": "Beautiful print design collection, magazines, brochures and packaging on dark textured surface, professional graphic design portfolio, overhead photography, minimalist layout",
        "negative_prompt": "text, blurry, low quality",
        "width": 1024,
        "height": 1024,
    },
]


def ensure_output_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}")


def register_and_login():
    """Register a test user and get auth token"""
    email = "youmedia-gen@test.com"
    password = "YouMedia2024!"

    # Try login first
    try:
        resp = requests.post(f"{API}/auth/login", json={"email": email, "password": password})
        if resp.status_code == 200:
            return resp.json()["access_token"]
    except:
        pass

    # Register
    try:
        resp = requests.post(f"{API}/auth/register", json={
            "email": email,
            "username": "youmedia-gen",
            "password": password
        })
        if resp.status_code in [200, 201]:
            token_data = resp.json()
            return token_data.get("access_token")
    except:
        pass

    # Try login again
    resp = requests.post(f"{API}/auth/login", json={"email": email, "password": password})
    if resp.status_code == 200:
        return resp.json()["access_token"]

    print(f"Failed to authenticate. Status: {resp.status_code}")
    print(f"Response: {resp.text}")
    sys.exit(1)


def generate_image(token, prompt_data):
    """Generate an image using the backend API"""
    headers = {"Authorization": f"Bearer {token}"}

    resp = requests.post(f"{API}/images/generate", json={
        "prompt": prompt_data["prompt"],
        "negative_prompt": prompt_data.get("negative_prompt", ""),
        "width": prompt_data.get("width", 1024),
        "height": prompt_data.get("height", 1024),
    }, headers=headers)

    if resp.status_code != 200:
        print(f"  ERROR: Generation failed with status {resp.status_code}")
        print(f"  Response: {resp.text[:200]}")
        return None

    job_data = resp.json()
    job_id = job_data.get("job_id") or job_data.get("id")
    print(f"  Job created: {job_id}")

    # Poll for completion
    for attempt in range(60):  # Max 5 minutes
        time.sleep(5)
        status_resp = requests.get(f"{API}/images/job/{job_id}", headers=headers)
        if status_resp.status_code == 200:
            job = status_resp.json()
            status = job.get("status")
            if status == "completed":
                return job
            elif status == "failed":
                print(f"  ERROR: Job failed: {job.get('error_message', 'Unknown error')}")
                return None
            print(f"  Status: {status}... (attempt {attempt+1})")
        else:
            print(f"  Status check failed: {status_resp.status_code}")

    print("  ERROR: Timeout waiting for image generation")
    return None


def download_image(token, image_url, filename):
    """Download generated image and save to output directory"""
    headers = {"Authorization": f"Bearer {token}"}

    # Handle relative URLs
    if image_url.startswith("/"):
        image_url = f"{BACKEND_URL}{image_url}"

    resp = requests.get(image_url, headers=headers)
    if resp.status_code == 200:
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, "wb") as f:
            f.write(resp.content)
        print(f"  Saved: {filepath} ({len(resp.content)} bytes)")
        return True
    else:
        print(f"  ERROR: Download failed for {image_url}: {resp.status_code}")
        return False


def main():
    print("=" * 60)
    print("YouMedia Website Image Generator")
    print("=" * 60)
    print()

    ensure_output_dir()

    print("Authenticating...")
    token = register_and_login()
    print(f"Authenticated successfully!")
    print()

    for i, prompt_data in enumerate(IMAGE_PROMPTS):
        print(f"[{i+1}/{len(IMAGE_PROMPTS)}] Generating: {prompt_data['filename']}")
        print(f"  Prompt: {prompt_data['prompt'][:80]}...")

        job = generate_image(token, prompt_data)
        if job:
            images = job.get("images", [])
            if images:
                # Download the first generated image
                image_url = images[0].get("url", "")
                download_image(token, image_url, prompt_data["filename"])
            else:
                # Try single image_url
                image_url = job.get("image_url", "")
                if image_url:
                    download_image(token, image_url, prompt_data["filename"])
                else:
                    print("  ERROR: No images in response")
        print()

    print("=" * 60)
    print("Done! Images saved to:", OUTPUT_DIR)
    print("Update YouMediaWebsite.js to use the generated images.")
    print("=" * 60)


if __name__ == "__main__":
    main()
