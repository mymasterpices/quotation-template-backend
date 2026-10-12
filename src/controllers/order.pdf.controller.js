const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const Order = require("../models/order.model"); // adjust to your model path/name
const { UPLOAD_DIR } = require("../config/paths");

/* ---------- Theme ---------- */
const C = {
  plum: "#4A0F2A", // brand: titles, total panel, icons
  sand: "#efdcd0", // brand: table headers
  cream: "#F8EEE6", // brand: page background
  sandSoft: "#F4E8DF", // light tint of sand (info strip, tint cards, shaded rows)
  card: "#FCF8F5", // card surface (cream lightened)
  ink: "#2B2B2B",
  muted: "#7A6A68",
  line: "#E6D6CB",
  plumSoft: "#E4CFD6", // light text on plum
  white: "#FFFFFF",
};

/* ---------- Fonts ----------
 * Drop these 4 files in  <project>/assets/fonts  (Noto Serif + Noto Sans, both
 * contain the rupee glyph):
 *   NotoSerif-Regular.ttf  NotoSerif-Bold.ttf  NotoSans-Regular.ttf  NotoSans-Bold.ttf
 * If any is missing we fall back to built-in Times/Helvetica and print "Rs." instead of the rupee symbol.
 */
const FONT_DIR = path.join(__dirname, "../assets/fonts");
const FONT_FILES = {
  Serif: "NotoSerif-Regular.ttf",
  SerifBold: "NotoSerif-Bold.ttf",
  Sans: "NotoSans-Regular.ttf",
  SansBold: "NotoSans-Bold.ttf",
};
const HAS_CUSTOM_FONTS = Object.values(FONT_FILES).every((f) =>
  fs.existsSync(path.join(FONT_DIR, f)),
);
const F = HAS_CUSTOM_FONTS
  ? { ...Object.fromEntries(Object.keys(FONT_FILES).map((k) => [k, k])) }
  : {
      Serif: "Times-Roman",
      SerifBold: "Times-Bold",
      Sans: "Helvetica",
      SansBold: "Helvetica-Bold",
    };
const SCRIPT_FONT = "Times-Italic"; // "Thank you" sign-off (swap for a script TTF if you like)

const registerFonts = (doc) => {
  if (!HAS_CUSTOM_FONTS) return;
  Object.entries(FONT_FILES).forEach(([name, file]) =>
    doc.registerFont(name, path.join(FONT_DIR, file)),
  );
};

/* ---------- Page geometry ---------- */
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 36; // side margin
const CW = PAGE_W - M * 2; // content width
const MAX_EXTRA_IMAGES = 8; // images after the first, shown in the gallery card
const FOOTER_Y = PAGE_H - 78; // sign-off block (last page)
const CONTENT_BOTTOM = FOOTER_Y - 2; // content must stop above the footer

/* ---------- Helpers ---------- */
const inr = (n) =>
  n == null
    ? "-"
    : `${HAS_CUSTOM_FONTS ? "₹" : "Rs."} ${new Intl.NumberFormat("en-IN", {
        maximumFractionDigits: 0,
      }).format(n)}`;

const fmtDate = (d) =>
  new Date(d)
    .toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    })
    .replace(/\b(am|pm)\b/i, (m) => m.toLowerCase());

const titleCase = (s = "") =>
  String(s).replace(
    /\w\S*/g,
    (t) => t[0].toUpperCase() + t.slice(1).toLowerCase(),
  );

// 'G-H_VS-SI' -> 'G-H / VS-SI', 'natural' -> 'Natural'
const formatQuality = (key) => {
  if (!key) return "-";
  const spaced = String(key).replace(/_/g, " / ");
  if (spaced === spaced.toUpperCase()) return spaced;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

// 'restOfWorld' -> 'Rest of World'
const countryLabel = (c) =>
  c === "india" ? "India" : c === "restOfWorld" ? "Rest of World" : c || "-";

const sumAmount = (arr = []) =>
  arr.reduce((s, x) => s + (Number(x.amount) || 0), 0);

const quoteNo = (order) =>
  order.quotationNo || `QT-${String(order._id).slice(-4).toUpperCase()}`;

// Resolve an uploaded image on disk (basename() blocks path traversal)
const imagePath = (img) => {
  if (!img?.url) return null;
  const file = path.join(UPLOAD_DIR, path.basename(img.url));
  const ok = /\.(png|jpe?g)$/i.test(file) && fs.existsSync(file);
  return ok ? file : null;
};

const paintBackground = (doc) => {
  doc.save();
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(C.cream);
  doc.restore();
};

const ensureSpace = (doc, needed) => {
  if (doc.y + needed > CONTENT_BOTTOM) doc.addPage();
};

/* ---------- Vector artwork ---------- */
// Outline lotus. (cx, by) = bottom-centre, s = height of the tallest petal
function lotus(doc, cx, by, s, color, lw = 1, opacity = 1) {
  const petals = [
    [-64, 0.6],
    [-33, 0.84],
    [0, 1],
    [33, 0.84],
    [64, 0.6],
  ];
  doc.save().lineWidth(lw).strokeColor(color).strokeOpacity(opacity);
  petals.forEach(([angle, k]) => {
    const l = s * k;
    const w = s * 0.2;
    doc
      .save()
      .translate(cx, by)
      .rotate(angle, { origin: [0, 0] });
    doc
      .moveTo(0, 0)
      .bezierCurveTo(-w, -l * 0.3, -w * 0.9, -l * 0.75, 0, -l)
      .bezierCurveTo(w * 0.9, -l * 0.75, w, -l * 0.3, 0, 0)
      .stroke();
    doc.restore();
  });
  doc
    .moveTo(cx - s * 0.55, by - s * 0.04)
    .bezierCurveTo(
      cx - s * 0.3,
      by + s * 0.3,
      cx + s * 0.3,
      by + s * 0.3,
      cx + s * 0.55,
      by - s * 0.04,
    )
    .stroke();
  doc.restore();
}

// Small 12x12 line icons, drawn with the brand colour
const icons = {
  person(doc, x, y) {
    doc.circle(x + 6, y + 3.5, 3).stroke();
    doc
      .moveTo(x + 0.5, y + 12)
      .bezierCurveTo(x + 0.5, y + 6.5, x + 11.5, y + 6.5, x + 11.5, y + 12)
      .stroke();
  },
  mail(doc, x, y) {
    doc.roundedRect(x, y + 1.5, 12, 9, 1.2).stroke();
    doc
      .moveTo(x + 0.6, y + 2.4)
      .lineTo(x + 6, y + 7)
      .lineTo(x + 11.4, y + 2.4)
      .stroke();
  },
  phone(doc, x, y) {
    doc.roundedRect(x + 2.5, y, 7, 12, 1.4).stroke();
    doc
      .moveTo(x + 5, y + 10)
      .lineTo(x + 7, y + 10)
      .stroke();
  },
  diamond(doc, x, y) {
    doc
      .moveTo(x + 3, y + 1)
      .lineTo(x + 9, y + 1)
      .lineTo(x + 12, y + 4.5)
      .lineTo(x + 6, y + 11.5)
      .lineTo(x, y + 4.5)
      .closePath()
      .stroke();
    doc
      .moveTo(x, y + 4.5)
      .lineTo(x + 12, y + 4.5)
      .stroke();
    doc
      .moveTo(x + 4.5, y + 4.5)
      .lineTo(x + 6, y + 11.5)
      .lineTo(x + 7.5, y + 4.5)
      .stroke();
  },
  gem(doc, x, y) {
    doc
      .moveTo(x + 6, y)
      .lineTo(x + 11.5, y + 3)
      .lineTo(x + 11.5, y + 9)
      .lineTo(x + 6, y + 12)
      .lineTo(x + 0.5, y + 9)
      .lineTo(x + 0.5, y + 3)
      .closePath()
      .stroke();
    doc
      .moveTo(x + 6, y + 3)
      .lineTo(x + 9, y + 4.8)
      .lineTo(x + 9, y + 7.6)
      .lineTo(x + 6, y + 9.4)
      .lineTo(x + 3, y + 7.6)
      .lineTo(x + 3, y + 4.8)
      .closePath()
      .stroke();
  },
  calc(doc, x, y) {
    doc.roundedRect(x + 1, y, 10, 12, 1.5).stroke();
    doc
      .moveTo(x + 3, y + 3)
      .lineTo(x + 9, y + 3)
      .stroke();
    [
      [3.5, 6],
      [6, 6],
      [8.5, 6],
      [3.5, 9],
      [6, 9],
      [8.5, 9],
    ].forEach(([dx, dy]) => doc.circle(x + dx, y + dy, 0.55).fill(C.plum));
  },
  shield(doc, x, y) {
    doc
      .moveTo(x + 6, y)
      .lineTo(x + 11, y + 2)
      .lineTo(x + 11, y + 6)
      .bezierCurveTo(x + 11, y + 9, x + 8, y + 11, x + 6, y + 12)
      .bezierCurveTo(x + 4, y + 11, x + 1, y + 9, x + 1, y + 6)
      .lineTo(x + 1, y + 2)
      .closePath()
      .stroke();
    doc
      .moveTo(x + 3.8, y + 6)
      .lineTo(x + 5.5, y + 7.8)
      .lineTo(x + 8.4, y + 4.4)
      .stroke();
  },
  leaf(doc, x, y) {
    doc
      .moveTo(x + 1, y + 11)
      .bezierCurveTo(x, y + 4, x + 6, y, x + 11, y + 1)
      .bezierCurveTo(x + 12, y + 7, x + 7, y + 11, x + 1, y + 11)
      .closePath()
      .stroke();
    doc
      .moveTo(x + 1, y + 11)
      .lineTo(x + 7, y + 5)
      .stroke();
  },
  image(doc, x, y) {
    doc.roundedRect(x, y + 0.5, 12, 11, 1.5).stroke();
    doc.circle(x + 8.5, y + 4, 1.2).stroke();
    doc
      .moveTo(x + 0.8, y + 10)
      .lineTo(x + 4.5, y + 6.5)
      .lineTo(x + 7.2, y + 9)
      .lineTo(x + 9, y + 7.4)
      .lineTo(x + 11.2, y + 10)
      .stroke();
  },
  star(doc, x, y) {
    const cx = x + 6,
      cy = y + 6.3,
      R = 6,
      r = 2.6;
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rad = i % 2 ? r : R;
      const px = cx + rad * Math.cos(a);
      const py = cy + rad * Math.sin(a);
      i === 0 ? doc.moveTo(px, py) : doc.lineTo(px, py);
    }
    doc.closePath().stroke();
  },
};

function drawIcon(doc, name, x, y) {
  doc
    .save()
    .lineWidth(0.9)
    .strokeColor(C.plum)
    .lineJoin("round")
    .lineCap("round");
  icons[name](doc, x, y);
  doc.restore();
}

/* ---------- Layout building blocks ---------- */
const HEADER_H = 22;
const CELL_PAD = 8;

/**
 * Measure a table. rows: array of cell arrays, or { cells, bold?, shaded? }
 * columns: [{ label, width, align?, bold? }]
 */
function layoutTable(doc, columns, rows, fontSize = 9, minRow = 22) {
  const items = rows.map((r) => {
    const row = Array.isArray(r) ? { cells: r } : r;
    const th = Math.max(
      ...row.cells.map((cell, i) => {
        const bold = row.bold || columns[i].bold;
        doc.font(bold ? F.SansBold : F.Sans).fontSize(fontSize);
        return doc.heightOfString(String(cell), {
          width: columns[i].width - CELL_PAD * 2,
        });
      }),
    );
    return { ...row, th, h: Math.max(minRow, th + 10) };
  });
  const width = columns.reduce((s, c) => s + c.width, 0);
  const height = HEADER_H + items.reduce((s, r) => s + r.h, 0);
  return { columns, items, width, height, fontSize };
}

function drawTable(doc, x, y, t) {
  const { columns, items, width, fontSize } = t;

  // header
  doc.roundedRect(x, y, width, HEADER_H, 6).fill(C.sand);
  let cx = x;
  doc.font(F.SansBold).fontSize(7.5).fillColor(C.ink);
  columns.forEach((col) => {
    doc.text(col.label, cx + CELL_PAD, y + 8, {
      width: col.width - CELL_PAD * 2,
      align: col.align || "left",
      lineBreak: false,
    });
    cx += col.width;
  });

  // rows
  let ry = y + HEADER_H;
  items.forEach((row, idx) => {
    if (row.shaded) doc.rect(x, ry, width, row.h).fill(C.sandSoft);

    cx = x;
    row.cells.forEach((cell, i) => {
      const bold = row.bold || columns[i].bold;
      doc
        .font(bold ? F.SansBold : F.Sans)
        .fontSize(fontSize)
        .fillColor(C.ink)
        .text(String(cell), cx + CELL_PAD, ry + (row.h - row.th) / 2, {
          width: columns[i].width - CELL_PAD * 2,
          align: columns[i].align || "left",
        });
      cx += columns[i].width;
    });

    if (idx < items.length - 1) {
      doc
        .moveTo(x + 4, ry + row.h)
        .lineTo(x + width - 4, ry + row.h)
        .lineWidth(0.5)
        .strokeColor(C.line)
        .stroke();
    }
    ry += row.h;
  });
}

/** Rounded section card with icon + serif title. draw(x, y, innerWidth) paints the body. */
function card(doc, title, iconName, bodyH, draw) {
  const HEAD = 35;
  const PAD = 12;
  const total = HEAD + bodyH + PAD;
  ensureSpace(doc, total);

  const x = M;
  const y = doc.y;
  doc
    .roundedRect(x, y, CW, total, 10)
    .lineWidth(0.7)
    .fillAndStroke(C.card, C.line);
  drawIcon(doc, iconName, x + PAD + 2, y + 12);
  doc
    .font(F.SerifBold)
    .fontSize(13)
    .fillColor(C.plum)
    .text(title, x + PAD + 28, y + 11, { lineBreak: false });

  draw(x + PAD + 4, y + HEAD, CW - (PAD + 4) * 2);
  doc.y = y + total + 8;
}

function emptyCard(doc, title, iconName, message) {
  card(doc, title, iconName, 14, (x, y) => {
    doc
      .font(F.Sans)
      .fontSize(9)
      .fillColor(C.muted)
      .text(message, x, y, { lineBreak: false });
  });
}

// label + value pair; used in the metal grid and customer strip
function labelValue(doc, label, value, x, y, w, valueSize = 11) {
  doc
    .font(F.SansBold)
    .fontSize(6.5)
    .fillColor(C.muted)
    .text(label, x, y, { width: w, lineBreak: false, characterSpacing: 1.1 });
  doc
    .font(F.SansBold)
    .fontSize(valueSize)
    .fillColor(C.ink)
    .text(value || "-", x, y + 12, {
      width: w,
      lineBreak: false,
      ellipsis: true,
    });
}

/* ---------- Controller ---------- */
// GET /api/orders/:id/pdf               -> opens in browser tab
// GET /api/orders/:id/pdf?download=true -> forces a file download
exports.downloadOrderPdf = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id" });
    }

    const order = await Order.findById(id).lean();
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const no = quoteNo(order);
    const disposition = req.query.download === "true" ? "attachment" : "inline";

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${no}.pdf"`,
    );

    const doc = new PDFDocument({
      size: "A4",
      // bottom margin 0: we do our own page breaks (ensureSpace) and write the
      // footer inside the bottom area without PDFKit auto-adding pages
      margins: { top: M, left: M, right: M, bottom: 0 },
      bufferPages: true,
      info: { Title: `Quotation ${no}`, Author: "RK Jewellers" },
    });
    registerFonts(doc);
    doc.pipe(res);

    paintBackground(doc); // page 1
    doc.on("pageAdded", () => paintBackground(doc)); // every further page

    /* ===== Header ===== */
    const brandX = M;
    const brandText = "RK JEWELLERS";
    doc.font(F.Serif).fontSize(25);
    const brandW = doc.widthOfString(brandText, { characterSpacing: 2.5 });
    doc
      .fillColor(C.plum)
      .text(brandText, brandX, 34, { lineBreak: false, characterSpacing: 2.5 });
    doc
      .font(F.Sans)
      .fontSize(7)
      .fillColor(C.ink)
      .text("SOUTH EXTENSION-II", brandX, 66, {
        width: brandW,
        align: "center",
        lineBreak: false,
        characterSpacing: 3.2,
      });

    doc
      .font(F.Serif)
      .fontSize(30)
      .fillColor(C.plum)
      .text("Quotation", M, 22, {
        width: CW,
        align: "right",
        lineBreak: false,
      });
    doc
      .font(F.Sans)
      .fontSize(9)
      .fillColor(C.ink)
      .text(`Quote #${no}`, M, 60, {
        width: CW,
        align: "right",
        lineBreak: false,
      });
    doc
      .fontSize(9)
      .text(fmtDate(order.createdAt), M, 74, {
        width: CW,
        align: "right",
        lineBreak: false,
      });

    doc
      .moveTo(M, 96)
      .lineTo(M + CW, 96)
      .lineWidth(0.5)
      .strokeColor(C.line)
      .stroke();

    /* ===== Customer strip (single line) ===== */
    const info = order.basicInfo || {};
    const sy = 106;
    const sh = 44;
    doc.roundedRect(M, sy, CW, sh, 8).fill(C.sandSoft);

    const cols = [
      { icon: "person", label: "CUSTOMER", value: info.customerName, w: 0.22 },
      { icon: "phone", label: "PHONE", value: info.phoneNumber, w: 0.22 },
      { icon: "mail", label: "EMAIL", value: info.email, w: 0.32 },
      {
        icon: "person",
        label: "SALES PERSON",
        value: info.salesPerson,
        w: 0.24,
      },
    ];
    let cx0 = M;
    cols.forEach((c, i) => {
      const cw = CW * c.w;
      drawIcon(doc, c.icon, cx0 + 14, sy + 16);
      doc
        .font(F.SansBold)
        .fontSize(6.5)
        .fillColor(C.muted)
        .text(c.label, cx0 + 34, sy + 9, {
          width: cw - 40,
          lineBreak: false,
          characterSpacing: 1.1,
        });
      doc
        .font(F.Sans)
        .fontSize(9.5)
        .fillColor(C.ink)
        .text(c.value || "-", cx0 + 34, sy + 21, {
          width: cw - 40,
          lineBreak: false,
          ellipsis: true,
        });
      if (i > 0) {
        doc
          .moveTo(cx0, sy + 10)
          .lineTo(cx0, sy + sh - 10)
          .lineWidth(0.5)
          .strokeColor(C.sand)
          .stroke();
      }
      cx0 += cw;
    });

    /* ===== Product: image + metal ===== */
    const metal = order.metal || {};
    const py = sy + sh + 12;
    const imgW = 190;
    const imgH = 126;

    // faint lotus watermark behind the metal block
    lotus(doc, PAGE_W - M - 36, py + 80, 74, C.plum, 0.8, 0.12);

    doc.roundedRect(M, py, imgW, imgH, 10).fill(C.sand);
    const validImages = (order.images || []).map(imagePath).filter(Boolean);
    const mainImg = validImages[0];
    const extraImages = validImages.slice(1, 1 + MAX_EXTRA_IMAGES);
    if (mainImg) {
      doc.save();
      doc.roundedRect(M, py, imgW, imgH, 10).clip();
      doc.image(mainImg, M, py, {
        cover: [imgW, imgH],
        align: "center",
        valign: "center",
      });
      doc.restore();
    } else {
      doc
        .font(F.Sans)
        .fontSize(10)
        .fillColor(C.muted)
        .text("No image", M, py + imgH / 2 - 5, {
          width: imgW,
          align: "center",
          lineBreak: false,
        });
    }

    const rx = M + imgW + 24;
    const rw = PAGE_W - M - rx;
    doc
      .font(F.Serif)
      .fontSize(22)
      .fillColor(C.plum)
      .text(titleCase(order.category) || "-", rx, py, {
        width: rw,
        lineBreak: false,
      });
    doc
      .moveTo(rx, py + 31)
      .lineTo(rx + 26, py + 31)
      .lineWidth(1)
      .strokeColor(C.plum)
      .stroke();
    doc
      .font(F.SerifBold)
      .fontSize(12)
      .fillColor(C.plum)
      .text("Metal Details", rx, py + 39, { lineBreak: false });

    const gy = py + 58;
    const gw = Math.round(rw * 0.62);
    const gh = 68;
    doc
      .roundedRect(rx, gy, gw, gh, 8)
      .lineWidth(0.7)
      .fillAndStroke(C.card, C.line);
    doc.lineWidth(0.5).strokeColor(C.line);
    doc
      .moveTo(rx + gw / 2, gy + 10)
      .lineTo(rx + gw / 2, gy + gh - 10)
      .stroke();
    doc
      .moveTo(rx + 14, gy + gh / 2)
      .lineTo(rx + gw - 14, gy + gh / 2)
      .stroke();

    const half = gw / 2 - 24;
    labelValue(doc, "PURITY", metal.purity, rx + 16, gy + 7, half, 10.5);
    labelValue(
      doc,
      "WEIGHT",
      `${metal.weight ?? 0} g`,
      rx + gw / 2 + 16,
      gy + 7,
      half,
      10.5,
    );
    labelValue(
      doc,
      "RATE",
      metal.rate != null ? `${inr(metal.rate)}/g` : "-",
      rx + 16,
      gy + gh / 2 + 7,
      half,
      10.5,
    );
    labelValue(
      doc,
      "AMOUNT",
      inr(metal.amount),
      rx + gw / 2 + 16,
      gy + gh / 2 + 7,
      half,
      10.5,
    );

    const tx = rx + gw + 10;
    const tw = rw - gw - 10;
    doc.roundedRect(tx, gy, tw, gh, 8).fill(C.sandSoft);
    doc
      .font(F.SerifBold)
      .fontSize(11)
      .fillColor(C.plum)
      .text(
        `${metal.purity || ""} ${metal.type || "Gold"}`.trim(),
        tx + 12,
        gy + 10,
        {
          width: tw - 20,
          lineBreak: false,
          ellipsis: true,
        },
      );
    doc
      .font(F.Sans)
      .fontSize(7)
      .fillColor(C.muted)
      .text(
        `Premium ${metal.purity || ""} ${(metal.type || "gold").toLowerCase()}, crafted for lasting brilliance and timeless beauty.`.replace(
          /\s+/g,
          " ",
        ),
        tx + 12,
        gy + 26,
        { width: tw - 22 },
      );

    doc.y = py + imgH + 12;

    /* ===== Diamond details ===== */
    const diamonds = order.diamonds || [];
    const stones = order.stones || [];
    const TW = CW - 32; // table width inside a card

    if (diamonds.length) {
      const t = layoutTable(
        doc,
        [
          { label: "Shape", width: 90, bold: true },
          { label: "Quality", width: 100 },
          { label: "Weight", width: 70 },
          { label: "Pieces", width: 60 },
          { label: "Rate", width: 80 },
          { label: "Amount", width: TW - 400 },
        ],
        diamonds.map((d) => [
          d.shape || "-",
          formatQuality(d.quality),
          `${d.weight} ct`,
          d.pieces,
          inr(d.rate),
          inr(d.amount),
        ]),
      );
      card(doc, "Diamond Details", "diamond", t.height, (x, y) =>
        drawTable(doc, x, y, t),
      );
    } else {
      emptyCard(
        doc,
        "Diamond Details",
        "diamond",
        "No diamonds in this quotation.",
      );
    }

    /* ===== Stone details ===== */
    if (stones.length) {
      const t = layoutTable(
        doc,
        [
          { label: "Stone", width: 95, bold: true },
          { label: "Shape", width: 75 },
          { label: "Quality", width: 68 },
          { label: "Weight", width: 55 },
          { label: "Pieces", width: 45 },
          { label: "Rate", width: 62 },
          { label: "Amount", width: TW - 400 },
        ],
        stones.map((s) => [
          s.label || s.type || "-",
          s.shape || "-",
          formatQuality(s.quality),
          `${s.weight} ct`,
          s.pieces,
          inr(s.rate),
          inr(s.amount),
        ]),
      );
      card(doc, "Stone Details", "gem", t.height, (x, y) =>
        drawTable(doc, x, y, t),
      );
    } else {
      emptyCard(doc, "Stone Details", "gem", "No stones in this quotation.");
    }

    /* ===== Estimate breakdown + total panel ===== */
    const est = order.estimate || {};

    // Fall back for older quotations saved without the new fields
    const makingCharge =
      est.makingCharge ??
      (est.makingChargePerGram != null
        ? est.makingChargePerGram * (metal.weight ?? 0)
        : null);
    const diamondTotal = est.diamondTotal ?? sumAmount(diamonds);
    const stoneTotal = est.stoneTotal ?? sumAmount(stones);
    const diamondPieces = diamonds.reduce((s, d) => s + (d.pieces || 0), 0);
    const diamondShapes = [...new Set(diamonds.map((d) => d.shape))].join(", ");
    const factor = est.countryFactor;

    const EST_TABLE_W = 325;
    const PANEL_GAP = 16;
    const panelW = TW - EST_TABLE_W - PANEL_GAP;

    const estTable = layoutTable(
      doc,
      [
        { label: "Description", width: 84 },
        { label: "Calculation / Basis", width: 165 },
        { label: "Amount", width: EST_TABLE_W - 247, align: "right" },
      ],
      [
        [
          "Metal",
          metal.rate != null
            ? `${metal.weight} g × ${inr(metal.rate)}`
            : `${metal.weight ?? 0} g`,
          inr(metal.amount),
        ],
        [
          "Making charge",
          est.makingChargePerGram != null
            ? `${metal.weight ?? 0} g × ${inr(est.makingChargePerGram)}`
            : "-",
          inr(makingCharge),
        ],
        [
          "Diamonds",
          diamonds.length ? `${diamondPieces} pieces • ${diamondShapes}` : "-",
          inr(diamondTotal),
        ],
        [
          "Stones",
          stones.length
            ? stones
                .map((s) => `${s.label || s.type} ${inr(s.amount)}`)
                .join(" + ")
            : "-",
          inr(stoneTotal),
        ],
        {
          cells: [
            "Base cost",
            "Metal + making + diamonds + stones",
            inr(est.baseCost),
          ],
          bold: true,
        },
        {
          cells: [
            "Country factor",
            factor != null
              ? `${countryLabel(est.country)} • ${factor}%`
              : countryLabel(est.country),
            factor != null ? `× ${(factor / 100).toFixed(2)}` : "-",
          ],
          bold: true,
        },
      ],
      8.5,
      20,
    );

    const estBodyH = Math.max(estTable.height, 126);
    card(doc, "Estimate Breakdown", "calc", estBodyH, (x, y) => {
      drawTable(doc, x, y, estTable);

      // total panel
      const px = x + EST_TABLE_W + PANEL_GAP;
      doc.roundedRect(px, y, panelW, estBodyH, 10).fill(C.plum);
      lotus(doc, px + panelW - 30, y + 50, 36, C.white, 0.8, 0.14);

      doc
        .font(F.Sans)
        .fontSize(10)
        .fillColor(C.white)
        .text("Total Estimate", px + 16, y + 12, { lineBreak: false });

      const totalStr = inr(est.total);
      let size = 24;
      doc.font(F.SerifBold).fontSize(size);
      while (size > 13 && doc.widthOfString(totalStr) > panelW - 28) {
        size -= 1;
        doc.fontSize(size);
      }
      doc
        .fillColor(C.white)
        .text(totalStr, px + 16, y + 30, { lineBreak: false });

      doc
        .moveTo(px + 16, y + 68)
        .lineTo(px + 42, y + 68)
        .lineWidth(0.8)
        .strokeColor(C.plumSoft)
        .stroke();

      const rowsY = y + estBodyH - 38;
      const inner = panelW - 32;
      const baseLabel = "Base Cost";
      const factorLabel =
        factor != null ? `Country Factor (${factor}%)` : "Country Factor";
      doc.font(F.Sans).fontSize(7.5).fillColor(C.white);
      doc.text(baseLabel, px + 16, rowsY, { width: inner, lineBreak: false });
      doc.text(inr(est.baseCost), px + 16, rowsY, {
        width: inner,
        align: "right",
        lineBreak: false,
      });
      doc.text(factorLabel, px + 16, rowsY + 16, {
        width: inner,
        lineBreak: false,
      });
      doc.text(
        factor != null ? `× ${(factor / 100).toFixed(2)}` : "-",
        px + 16,
        rowsY + 16,
        { width: inner, align: "right", lineBreak: false },
      );
    });

    /* ===== Extra product images (2nd image onwards) ===== */
    if (extraImages.length) {
      const GAP = 10;
      const PER_ROW = 4;
      const thumbH = 84;
      const rowsN = Math.ceil(extraImages.length / PER_ROW);
      const bodyH = rowsN * thumbH + (rowsN - 1) * GAP;
      card(doc, "More Views", "image", bodyH, (x, y, innerW) => {
        const thumbW = (innerW - GAP * (PER_ROW - 1)) / PER_ROW;
        extraImages.forEach((file, i) => {
          const tx = x + (i % PER_ROW) * (thumbW + GAP);
          const ty = y + Math.floor(i / PER_ROW) * (thumbH + GAP);
          doc.roundedRect(tx, ty, thumbW, thumbH, 8).fill(C.sand);
          doc.save();
          doc.roundedRect(tx, ty, thumbW, thumbH, 8).clip();
          doc.image(file, tx, ty, {
            cover: [thumbW, thumbH],
            align: "center",
            valign: "center",
          });
          doc.restore();
        });
      });
    }

    /* ===== Sign-off block (last page) ===== */
    if (doc.y > FOOTER_Y - 4) doc.addPage();

    doc
      .moveTo(M, FOOTER_Y)
      .lineTo(M + CW, FOOTER_Y)
      .lineWidth(0.5)
      .strokeColor(C.line)
      .stroke();
    doc
      .font(SCRIPT_FONT)
      .fontSize(24)
      .fillColor(C.plum)
      .text("Thank you", M + 6, FOOTER_Y + 8, { lineBreak: false });
    doc
      .font(F.Sans)
      .fontSize(8)
      .fillColor(C.muted)
      .text("for choosing RK Jewellers", M + 24, FOOTER_Y + 38, {
        lineBreak: false,
      });

    const perks = [
      ["shield", "Certified Quality", "Natural Diamonds"],
      ["leaf", "Ethically Sourced", "Gemstones"],
      ["star", "Exquisite Craftsmanship", "Since 1985"],
    ];
    const px0 = M + 150;
    const pw = (CW - 150) / 3;
    perks.forEach(([icon, title, sub], i) => {
      const ix = px0 + pw * i;
      doc
        .moveTo(ix, FOOTER_Y + 10)
        .lineTo(ix, FOOTER_Y + 46)
        .lineWidth(0.5)
        .strokeColor(C.line)
        .stroke();
      drawIcon(doc, icon, ix + 14, FOOTER_Y + 20);
      doc
        .font(F.Sans)
        .fontSize(7)
        .fillColor(C.ink)
        .text(title, ix + 34, FOOTER_Y + 20, {
          width: pw - 36,
          lineBreak: false,
          ellipsis: true,
        });
      doc
        .font(F.Sans)
        .fontSize(6.5)
        .fillColor(C.muted)
        .text(sub, ix + 34, FOOTER_Y + 31, {
          width: pw - 38,
          lineBreak: false,
        });
    });

    /* ===== Page footer on every page ===== */
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .font(F.Sans)
        .fontSize(7)
        .fillColor(C.muted)
        .text(
          `Quote #${no}   |   Generated ${fmtDate(new Date())}   |   Page ${i + 1} of ${range.count}`,
          M,
          PAGE_H - 18,
          { width: CW, align: "center", lineBreak: false },
        );
    }

    doc.end();
  } catch (err) {
    console.error(err);
    if (res.headersSent) return res.end();
    res.status(500).json({ success: false, message: "Could not generate PDF" });
  }
};
