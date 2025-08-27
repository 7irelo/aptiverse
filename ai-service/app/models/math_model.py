import pytesseract
import cv2
import numpy as np
from typing import Dict
from PIL import Image


def analyze_math_work(file) -> Dict:
    image = np.array(Image.open(file.file))
    text = pytesseract.image_to_string(image)
    return {"extracted_working": text, "analysis": "WIP"}