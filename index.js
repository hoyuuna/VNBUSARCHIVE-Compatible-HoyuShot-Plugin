/**
 * HoyuShot Natural Colorimetry Pro Plugin
 *
 * Implements strict color balance & gamut protection rules:
 * 1. Neutral Gray Tint Correction (Warm/Cool/Magenta/Green)
 * 2. Saturation Bounds Enforcement (10% <= avgSat <= 52%)
 * 3. Soft-knee Gamut Highlight Compression when channel clipping > 4%
 */

// Hook 1: Can thiệp trước khi chụp ảnh (Exposure & EV bias)
function onBeforeCapture(params, settings) {
    console.log("[NAT Plugin] onBeforeCapture called with settings: " + JSON.stringify(settings));

    var evOffset = settings.targetEvBias !== undefined ? settings.targetEvBias : 0;
    var newEv = params.ev + evOffset;

    return {
        iso: params.iso,
        shutterNanos: params.shutterNanos,
        ev: newEv,
        customTag: "HoyuShot_NAT_Colorimetry_1.0"
    };
}

// Hook 2: Can thiệp phân tích trắc sắc học & tính toán tỷ lệ chỉnh màu
function onProcessPhoto(metrics, settings) {
    console.log("[NAT Plugin] onProcessPhoto metrics: " + JSON.stringify(metrics));

    var rGain = 1.0;
    var gGain = 1.0;
    var bGain = 1.0;
    var satMultiplier = 1.0;

    // Rule 1: Khử ám màu trên bề mặt trung tính (nếu bật enableTintCorrection)
    if (settings.enableTintCorrection) {
        var diffRB = metrics.avgR - metrics.avgB;
        var diffGB = metrics.avgG - metrics.avgB;
        var diffBR = metrics.avgB - metrics.avgR;
        var diffRG = metrics.avgR - metrics.avgG;
        var diffGR = metrics.avgG - metrics.avgR;

        // Ám vàng / Nóng màu: neutralDiffRB > 22 && neutralDiffGB > 10
        if (diffRB > 22.0 && diffGB > 10.0) {
            console.log("[NAT Plugin] Detected Warm Cast: Balancing down Red and boosting Blue");
            rGain *= 0.94;
            bGain *= 1.07;
        }
        // Ám xanh / Lạnh màu: neutralDiffBR > 20
        else if (diffBR > 20.0) {
            console.log("[NAT Plugin] Detected Cool Cast: Balancing up Red and toning down Blue");
            bGain *= 0.93;
            rGain *= 1.06;
        }
        // Ám tím / Hồng: neutralDiffRG > 18 && neutralDiffBR > 12
        else if (diffRG > 18.0 && diffBR > 12.0) {
            console.log("[NAT Plugin] Detected Magenta/Pink Cast: Boosting Green channel");
            gGain *= 1.06;
            rGain *= 0.96;
            bGain *= 0.96;
        }
        // Ám xanh lá: neutralDiffGR > 18 && neutralDiffGB > 12
        else if (diffGR > 18.0 && diffGB > 12.0) {
            console.log("[NAT Plugin] Detected Green Tint: Compensating Red and Blue");
            gGain *= 0.94;
            rGain *= 1.04;
            bGain *= 1.04;
        }
    }

    // Rule 2: Kiểm soát dải bão hòa màu 10% <= avgSat <= 52% (nếu bật saturationGuard)
    if (settings.saturationGuard) {
        if (metrics.avgSatPercent > 52.0) {
            console.log("[NAT Plugin] Oversaturated (" + metrics.avgSatPercent + "% > 52%): Compressing saturation");
            satMultiplier = Math.max(0.75, 52.0 / metrics.avgSatPercent);
        } else if (metrics.avgSatPercent < 10.0) {
            console.log("[NAT Plugin] Washed out (" + metrics.avgSatPercent + "% < 10%): Gently recovering vibrance");
            satMultiplier = 1.15;
        }
    }

    // Rule 3: Chống bệt màu / Gamut Highlight Compression khi kênh chạm trần > 4% (nếu bật antiClipping)
    if (settings.antiClipping && metrics.maxClipPercent > 4.0) {
        console.log("[NAT Plugin] Gamut clipping detected (" + metrics.maxClipPercent + "% > 4%): Softening channel highlights");
        satMultiplier *= 0.92;
        rGain = Math.min(rGain, 0.98);
        gGain = Math.min(gGain, 0.98);
        bGain = Math.min(bGain, 0.98);
    }

    return {
        gainR: rGain,
        gainG: gGain,
        gainB: bGain,
        satMultiplier: satMultiplier
    };
}
