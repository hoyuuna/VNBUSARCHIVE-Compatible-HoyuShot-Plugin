# VNBUSARCHIVE-Compatible HoyuShot Plugin

Official **VNBUSARCHIVE** photographic compliance plugin for **HoyuShot Camera**.

Enforces strict industrial colorimetry standards, neutral gray surface tint removal, saturation guardrails, and gamut highlight soft-knee compression.

---

## Features

### 1. Neutral Gray Surface Tint Balancer
Samplings of candidate neutral gray/white surfaces ($35 \le Y \le 230$, low saturation) are evaluated to detect and counteract 4 major color cast distortions:
- **Warm / Yellow Tint**: Detected when $R - B > 22$ and $G - B > 10$. Automatically scales down excessive red gain and restores balanced blue tones.
- **Cool / Blue Tint**: Detected when $B - R > 20$. Compensates red channels and tames heavy sky/shadow blue casts.
- **Magenta / Pink Tint**: Detected when $R - G > 18$ and $B - R > 12$. Elevates green channel response to fix sensor magenta drift.
- **Green Tint**: Detected when $G - R > 18$ and $G - B > 12$. Balances red and blue gains against foliage/tint reflection.

### 2. Standard Saturation Guard ($10\% \le avgSat \le 52\%$)
- Prevents neon / artificial oversaturation by compressing global saturation when $avgSat > 52\%$.
- Prevents pale / washed-out colors when $avgSat < 10\%$ (e.g. foggy or hazy scenes).

### 3. Gamut Soft-Knee Highlight Compression
- Protects vehicle body lines, reflective surfaces, and specular highlights from harsh color banding when any color channel exceeds $4\%$ pixel clipping at value 255.

---

## Installation via HoyuShot

1. Open **HoyuShot** on your device.
2. Tap the **Settings (Gear)** icon > **Advanced Settings**.
3. Scroll down to **`04 // PLUGINS & EXTENSIONS`**.
4. Tap **`+ INSTALL PLUGIN`**.
5. Paste the repository URL:
   ```
   https://github.com/hoyuuna/VNBUSARCHIVE-Compatible-HoyuShot-Plugin.git
   ```
6. Tap **`CLONE & INSTALL`**.
7. Tap **`SETTINGS`** on the plugin card to customize tint correction toggles, highlight EV bias, or saturation guard!
