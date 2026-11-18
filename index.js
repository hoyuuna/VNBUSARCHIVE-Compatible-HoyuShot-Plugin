/**
 * VNBUSARCHIVE-Compatible HoyuShot Plugin
 *
 * Tiêu chuẩn xử lý màu và trắc sắc học lưu trữ xe buýt & phương tiện:
 * 1. Khử 4 loại ám màu trên bề mặt trung tính (Ấm/Vàng, Lạnh/Xanh, Magenta/Hồng, Xanh lá)
 * 2. Khóa dải bão hòa màu an toàn (10% <= avgSat <= 52%)
 * 3. Nén dải màu mềm (Soft-knee Gamut Compression) khi kênh chạm trần > 4%
 */

// Hook 1: Can thiệp trước khi chụp ảnh (Exposure & EV bias)
function onBeforeCapture(params, settings) {
    console.log("[VNBUSARCHIVE Plugin] onBeforeCapture với cài đặt: " + JSON.stringify(settings));

    var evOffset = settings.targetEvBias !== undefined ? settings.targetEvBias : 0;
    var newEv = params.ev + evOffset;

    return {
        iso: params.iso,
        shutterNanos: params.shutterNanos,
        ev: newEv,
        customTag: "HoyuShot_VNBUSARCHIVE_Plugin_1.0"
    };
}

// Hook 2: Can thiệp phân tích trắc sắc học & tính toán tỷ lệ chỉnh màu
function onProcessPhoto(metrics, settings) {
    console.log("[VNBUSARCHIVE Plugin] onProcessPhoto metrics: " + JSON.stringify(metrics));

    var rGain = 1.0;
    var gGain = 1.0;
    var bGain = 1.0;
    var satMultiplier = 1.0;

    // Quy tắc 1: Khử ám màu trên bề mặt trung tính (nếu bật enableTintCorrection)
    if (settings.enableTintCorrection) {
        var diffRB = metrics.avgR - metrics.avgB;
        var diffGB = metrics.avgG - metrics.avgB;
        var diffBR = metrics.avgB - metrics.avgR;
        var diffRG = metrics.avgR - metrics.avgG;
        var diffGR = metrics.avgG - metrics.avgR;

        // Ám vàng / Nóng màu: neutralDiffRB > 22 && neutralDiffGB > 10
        if (diffRB > 22.0 && diffGB > 10.0) {
            console.log("[VNBUSARCHIVE Plugin] Phát hiện ám vàng: Giảm Red, bù Blue");
            rGain *= 0.94;
            bGain *= 1.07;
        }
        // Ám xanh / Lạnh màu: neutralDiffBR > 20
        else if (diffBR > 20.0) {
            console.log("[VNBUSARCHIVE Plugin] Phát hiện ám xanh dương: Giảm Blue, bù Red");
            bGain *= 0.93;
            rGain *= 1.06;
        }
        // Ám tím / Hồng: neutralDiffRG > 18 && neutralDiffBR > 12
        else if (diffRG > 18.0 && diffBR > 12.0) {
            console.log("[VNBUSARCHIVE Plugin] Phát hiện ám tím hồng: Bù Green channel");
            gGain *= 1.06;
            rGain *= 0.96;
            bGain *= 0.96;
        }
        // Ám xanh lá: neutralDiffGR > 18 && neutralDiffGB > 12
        else if (diffGR > 18.0 && diffGB > 12.0) {
            console.log("[VNBUSARCHIVE Plugin] Phát hiện ám xanh lá: Bù Red và Blue");
            gGain *= 0.94;
            rGain *= 1.04;
            bGain *= 1.04;
        }
    }

    // Quy tắc 2: Kiểm soát dải bão hòa màu 10% <= avgSat <= 52% (nếu bật saturationGuard)
    if (settings.saturationGuard) {
        if (metrics.avgSatPercent > 52.0) {
            console.log("[VNBUSARCHIVE Plugin] Màu quá rực (" + metrics.avgSatPercent + "% > 52%): Đang nén độ bão hòa");
            satMultiplier = Math.max(0.75, 52.0 / metrics.avgSatPercent);
        } else if (metrics.avgSatPercent < 10.0) {
            console.log("[VNBUSARCHIVE Plugin] Màu bị nhợt nhạt (" + metrics.avgSatPercent + "% < 10%): Đang hồi phục độ tươi");
            satMultiplier = 1.15;
        }
    }

    // Quy tắc 3: Chống bệt màu / Gamut Highlight Compression khi kênh chạm trần > 4% (nếu bật antiClipping)
    if (settings.antiClipping && metrics.maxClipPercent > 4.0) {
        console.log("[VNBUSARCHIVE Plugin] Phát hiện bệt màu highlight (" + metrics.maxClipPercent + "% > 4%): Làm mềm highlight");
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
