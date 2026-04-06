import streamlit as st
import numpy as np
import cv2
from PIL import Image
from ultralytics import YOLO
import pandas as pd
import io

# ---------------- CONFIG ----------------
MODEL_PATH = r"C:\MainProject\car_damage_detector\models\epoch80.pt"

# ---------------- MODEL ----------------
@st.cache_resource
def load_model():
    model = YOLO(MODEL_PATH)
    return model

model = load_model()

# ---------------- COLOR MAP ----------------
COLOR_MAP = {
    "dent": (255, 0, 0),
    "scratch": (0, 255, 0),
    "crack": (0, 0, 255),
    "glass shatter": (255, 255, 0),
    "lamp broken": (255, 0, 255),
    "tire flat": (0, 255, 255),
    "structural damage": (128, 0, 128)
}

# ---------------- COST ----------------
cost_mapping = {
    "dent": 2000,
    "scratch": 1500,
    "crack": 3000,
    "glass shatter": 8000,
    "lamp broken": 5000,
    "tire flat": 2500,
    "structural damage": 20000
}

# ---------------- UI ----------------
st.title("🚗 Car Damage Detection App (CPU Version)")
st.write("YOLOv8 + Segmentation + Cost Estimation")

uploaded_file = st.file_uploader("Upload Image", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    image = Image.open(uploaded_file).convert("RGB")
    image_np = np.array(image)

    st.image(image, caption="Uploaded Image", use_column_width=True)

    if st.button("Run Detection"):

        # 🔥 FORCE CPU
        results = model.predict(image_np, conf=0.25, device="cpu", verbose=False)

        annotated = image_np.copy()
        heatmap = np.zeros((image_np.shape[0], image_np.shape[1]), dtype=np.float32)

        detected_data = []
        img_area = image_np.shape[0] * image_np.shape[1]

        for r in results:

            boxes = r.boxes
            masks = r.masks

            # ---------------- MASKS ----------------
            if masks is not None and boxes is not None:
                masks_data = masks.data.cpu().numpy()

                for i in range(len(masks_data)):

                    mask = masks_data[i]
                    mask_resized = cv2.resize(mask, (image_np.shape[1], image_np.shape[0]))

                    cls_id = int(boxes.cls[i])
                    label = model.names[cls_id]
                    conf = float(boxes.conf[i])

                    color = COLOR_MAP.get(label, (255, 255, 255))

                    # Area %
                    mask_area = np.sum(mask_resized > 0.5)
                    area_percent = (mask_area / img_area) * 100

                    # Heatmap
                    heatmap += mask_resized

                    # Overlay mask
                    colored_mask = np.zeros_like(image_np)
                    for c in range(3):
                        colored_mask[:, :, c] = mask_resized * color[c]

                    annotated = cv2.addWeighted(
                        annotated, 1, colored_mask.astype(np.uint8), 0.4, 0
                    )

                    detected_data.append({
                        "Damage": label,
                        "Confidence": round(conf * 100, 2),
                        "Area (%)": round(area_percent, 2),
                        "Cost (₹)": cost_mapping.get(label, 0)
                    })

            # ---------------- BOXES ----------------
            if boxes is not None:
                for i in range(len(boxes)):

                    x1, y1, x2, y2 = map(int, boxes.xyxy[i])
                    conf = float(boxes.conf[i])
                    cls_id = int(boxes.cls[i])
                    label = model.names[cls_id]

                    color = COLOR_MAP.get(label, (255, 255, 255))

                    cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)

                    box_area = (x2 - x1) * (y2 - y1)
                    area_percent = (box_area / img_area) * 100

                    text = f"{label} {conf*100:.1f}% | {area_percent:.1f}%"

                    cv2.putText(
                        annotated,
                        text,
                        (x1, max(20, y1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        color,
                        2
                    )

        # ---------------- DATAFRAME ----------------
        df = pd.DataFrame(detected_data)

        if df.empty:
            st.warning("⚠️ No damages detected.")
            st.stop()

        # ---------------- HEATMAP ----------------
        heatmap_norm = cv2.normalize(heatmap, None, 0, 255, cv2.NORM_MINMAX)
        heatmap_color = cv2.applyColorMap(heatmap_norm.astype(np.uint8), cv2.COLORMAP_JET)
        heatmap_overlay = cv2.addWeighted(annotated, 0.7, heatmap_color, 0.3, 0)

        # ---------------- TABLE ----------------
        st.subheader("📊 Damage Summary")
        st.dataframe(df)

        total_cost = int(df["Cost (₹)"].sum())
        st.success(f"💰 Total Estimated Cost: ₹ {total_cost}")

        # ---------------- CARDS ----------------
        st.subheader("🧾 Damage Insights")

        cols = st.columns(3)
        for i, dmg in enumerate(df["Damage"].unique()):
            d = df[df["Damage"] == dmg]

            with cols[i % 3]:
                st.markdown(f"""
                <div style="padding:12px; border-radius:10px; background:#111; color:white;">
                    <h4>{dmg}</h4>
                    <p>Confidence: {d["Confidence"].mean():.1f}%</p>
                    <p>Area: {d["Area (%)"].sum():.1f}%</p>
                    <p>Cost: ₹{int(d["Cost (₹)"].sum())}</p>
                </div>
                """, unsafe_allow_html=True)

        # ---------------- OUTPUT ----------------
        st.subheader("🎯 Detection Output")
        st.image(annotated, use_column_width=True)

        st.subheader("🔥 Heatmap")
        st.image(heatmap_overlay, use_column_width=True)

        # ---------------- DOWNLOAD ----------------
        result_pil = Image.fromarray(annotated)
        buf = io.BytesIO()
        result_pil.save(buf, format="PNG")

        st.download_button(
            "⬇️ Download Result",
            buf.getvalue(),
            "result.png",
            "image/png"
        )