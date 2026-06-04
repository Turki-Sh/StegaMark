# StegaMark

**An Advanced Image Processing Project for Watermarking & Steganography**

***

![StegaMark Logo](StegaMarkLogo.webp)

StegaMark is a modern web application that demonstrates advanced image processing techniques for both visible and invisible (steganographic) watermarking. Redesigned with a sleek dark-themed studio interface, it empowers users to protect and analyze images directly in the browser and via a robust Python backend.

***

## 🚀 Try It Live

* **Frontend:** [StegaMark on GitHub Pages](https://turki-sh.github.io/StegaMark/)
* **Backend:** Hosted on PythonAnywhere ([API root](https://0QuQ.pythonanywhere.com))

***

## ✨ Features

* **Streamlined Studio Interface**
    * Direct-to-studio flow: upload and edit immediately. 
    * Drag-and-drop image upload support.
    * Custom dark UI palette with terminal green accents and custom scrollbar.
* **Visible Watermarking**
    * Add text or logo watermarks instantly.
    * Client-side rendering and download via HTML5 Canvas for text watermarks.
    * Control opacity, position, color, and tiling (Grid, Staggered, Diagonal, Single).
    * Adjustable tile spacing and angle.
* **Invisible Watermarking (LSB Steganography)**
    * Hide text messages or small logos within image pixels.
    * Adjustable encoding strength (number of LSBs used).
* **Watermark Extraction**
    * Extract hidden data from images watermarked using LSB.
* **Python Backend & API**
    * Flask server with Pillow (PIL) for complex pixel-level operations.
    * REST API endpoints: `/watermark`, `/extract`.
    * Command Line Interface for batch or scripted watermarking via `app.py`.

***

## 🛠️ How It Works

StegaMark operates through two integrated components:

### 1. Frontend
* Built with HTML, custom CSS, and JavaScript.
* Provides an interactive drag-and-drop studio for configuring watermark options and viewing results.
* Page structured for a logical flow: Studio -> Problem -> Code.

### 2. Backend
* Python Flask application (`app.py`).
* Handles steganographic encoding and extraction logic.
* Uses Pillow (PIL) for pixel-level image operations.
* Hosted live on PythonAnywhere.

***

## 📦 Download & Run Locally

**1. Clone the Repository:**
```bash
git clone [https://github.com/Turki-Sh/StegaMark.git](https://github.com/Turki-Sh/StegaMark.git)
cd StegaMark
