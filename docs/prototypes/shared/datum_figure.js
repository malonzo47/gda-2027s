// Shared datum figure for the structure prototypes.
//
// This is the "Datums and ellipsoids" animation from lectures/04_crs, pulled
// out of its OJS cells into a plain ES module, so that four very different
// page structures (slides, scrollytelling, stepper, map) can all drive the
// SAME figure. Each page just calls fig.setStep(n) for n = 1..6.
//
// Usage (plain JS or an OJS cell):
//   import {datumFigure, STEPS, CAPTIONS} from "../shared/datum_figure.js";
//   const fig = datumFigure();          // {node, setStep}
//   container.appendChild(fig.node);
//   fig.setStep(3);
//
// The geometry and captions are copied from the lecture unchanged, so the
// prototypes compare structure, not content.

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

// Same palette as the lecture's shared `col` object
export const col = {
  ocean: "#eef3f7", land: "#cfc9bc", grid: "#c3ced8", ink: "#33414d",
  red: "#d1495b", blue: "#1f5f8b", orange: "#e08a1e", green: "#5b8c5a"
};

// Step titles, as in the lecture's radio buttons
export const STEPS = [
  "The real Earth",
  "An ellipsoid",
  "NAD27: pinned in Kansas",
  "Tokyo Datum: pinned in Japan",
  "Satellites",
  "WGS 84: Earth-centered"
];

// One-line captions for each step (lecture text, unchanged)
export const CAPTIONS = [
  "The real Earth is lumpy (shape hugely exaggerated)",
  "An ellipsoid: a smooth shape we can do math on",
  "NAD27 (Clarke 1866): fits North America, pinned at Meades Ranch. Its center is NOT Earth's center",
  "Tokyo Datum (Bessel 1841): fits Japan, pinned in Tokyo. Different ellipsoid, different center. Dashed red = NAD27",
  "Satellites orbit Earth's center of mass, so we can now locate that center",
  "WGS 84: centered on Earth's center of mass. Dashed = the old local datums. Same lat/lon, different places"
];

// ---- Geometry, computed once (all in a 640 x 380 drawing space) ----
function geometry() {
  const W = 640, H = 380;
  const earth = {x: 430, y: 195};             // Earth's center of mass
  // The lumpy "real" Earth (a geoid, hugely exaggerated): a wobbly radius
  const rEarth = th => 118 * (1 + 0.05 * Math.sin(3 * th + 0.5) + 0.035 * Math.cos(5 * th) + 0.02 * Math.sin(8 * th + 1));
  const earthPath = d3.line().curve(d3.curveCardinalClosed)(
    d3.range(0, 2 * Math.PI, Math.PI / 60).map(th => [earth.x + rEarth(th) * Math.cos(th), earth.y - 0.9 * rEarth(th) * Math.sin(th)])
  );
  // Meades Ranch, Kansas: a point on the upper left of the cross-section
  const thPin = 125 * Math.PI / 180;
  const pin = [earth.x + rEarth(thPin) * Math.cos(thPin), earth.y - 0.9 * rEarth(thPin) * Math.sin(thPin)];
  // Clarke 1866 (NAD27): placed so its surface passes through the pin
  const nad27 = {rx: 100, ry: 82};
  nad27.x = pin[0] - nad27.rx * Math.cos(thPin);
  nad27.y = pin[1] + nad27.ry * Math.sin(thPin);
  // Tokyo Datum (Bessel 1841): pinned on the far side, own size and center
  const thTokyo = 40 * Math.PI / 180;
  const pinTokyo = [earth.x + rEarth(thTokyo) * Math.cos(thTokyo), earth.y - 0.9 * rEarth(thTokyo) * Math.sin(thTokyo)];
  const tokyo = {rx: 108, ry: 84};
  tokyo.x = pinTokyo[0] - tokyo.rx * Math.cos(thTokyo);
  tokyo.y = pinTokyo[1] + tokyo.ry * Math.sin(thTokyo);
  // WGS 84: centered on Earth's center of mass, a best fit everywhere
  const wgs84 = {rx: 121, ry: 104, x: earth.x, y: earth.y};
  const start = {rx: 112, ry: 94, x: 140, y: 195};  // ellipsoid parked on the left
  return {W, H, earth, earthPath, pin, pinTokyo, nad27, tokyo, wgs84, start};
}

// ---- Build the figure; returns {node, setStep} ----
// options.caption: also draw the caption line under the figure (default true)
export function datumFigure({caption = true} = {}) {
  const g = geometry();
  const {W, H, earth, earthPath, pin, pinTokyo, nad27, tokyo, start} = g;

  const wrap = document.createElement("div");
  wrap.className = "datum-figure";
  const svg = d3.select(wrap).append("svg").attr("viewBox", [0, 0, W, H])
    .style("width", "100%").style("height", "auto").style("display", "block");

  // Movement uses CSS transitions, set up here and triggered by setStep()
  const fade = "opacity 1s ease";
  const glide = "transform 1.4s ease, opacity 1s ease";

  // Satellite orbit (dashed) and a satellite circling Earth's center
  const sat = svg.append("g").attr("class", "sat").style("opacity", 0).style("transition", fade);
  sat.append("circle").attr("cx", earth.x).attr("cy", earth.y).attr("r", 170)
    .attr("fill", "none").attr("stroke", "#9aa5ad").attr("stroke-dasharray", "3 5");
  const craft = sat.append("g");
  craft.append("rect").attr("x", earth.x - 6).attr("y", earth.y - 176).attr("width", 12).attr("height", 12).attr("fill", col.ink);
  craft.append("rect").attr("x", earth.x - 26).attr("y", earth.y - 173).attr("width", 18).attr("height", 6).attr("fill", col.blue);
  craft.append("rect").attr("x", earth.x + 8).attr("y", earth.y - 173).attr("width", 18).attr("height", 6).attr("fill", col.blue);
  craft.append("animateTransform").attr("attributeName", "transform").attr("type", "rotate")
    .attr("from", `0 ${earth.x} ${earth.y}`).attr("to", `-360 ${earth.x} ${earth.y}`)
    .attr("dur", "9s").attr("repeatCount", "indefinite");

  // The lumpy Earth and its center of mass
  svg.append("path").attr("d", earthPath).attr("fill", "#cfe0d2").attr("stroke", col.green).attr("stroke-width", 2);
  svg.append("path").attr("d", `M${earth.x - 7},${earth.y}h14M${earth.x},${earth.y - 7}v14`).attr("stroke", col.green).attr("stroke-width", 2.5);
  svg.append("text").attr("x", earth.x + 10).attr("y", earth.y + 18).attr("font-size", 12).attr("fill", col.green).text("center of mass");

  // Dashed "ghosts" of the local datums, left behind for comparison
  const ghost = svg.append("ellipse").attr("fill", "none").attr("stroke", col.red).attr("stroke-dasharray", "5 4")
    .attr("cx", nad27.x).attr("cy", nad27.y).attr("rx", nad27.rx).attr("ry", nad27.ry)
    .style("opacity", 0).style("transition", fade);
  const ghostTokyo = svg.append("ellipse").attr("fill", "none").attr("stroke", col.orange)
    .attr("stroke-dasharray", "5 4").attr("stroke-width", 1.5)
    .attr("cx", tokyo.x).attr("cy", tokyo.y).attr("rx", tokyo.rx).attr("ry", tokyo.ry)
    .style("opacity", 0).style("transition", fade);

  // The ellipsoid with its a and b axes. The outer group moves it; the inner
  // group scales it to each datum's size (non-scaling-stroke keeps the
  // outline the same thickness).
  const ell = svg.append("g").style("opacity", 0)
    .style("transform", `translate(${start.x}px, ${start.y}px)`).style("transition", glide);
  const shape = ell.append("g").style("transition", glide);
  shape.append("ellipse").attr("rx", start.rx).attr("ry", start.ry)
    .attr("fill", "none").attr("stroke", col.red).attr("stroke-width", 2.5).attr("vector-effect", "non-scaling-stroke");
  ell.append("circle").attr("r", 3.5).attr("fill", col.red);
  const axes = ell.append("g").style("transition", fade);
  axes.append("line").attr("x2", start.rx).attr("stroke", col.red).attr("stroke-width", 1.5);
  axes.append("line").attr("y2", -start.ry).attr("stroke", col.red).attr("stroke-width", 1.5);
  axes.append("text").attr("x", start.rx / 2).attr("y", 16).attr("text-anchor", "middle").attr("font-size", 14).attr("fill", col.red).text("a");
  axes.append("text").attr("x", 8).attr("y", -start.ry / 2).attr("font-size", 14).attr("fill", col.red).text("b");
  axes.append("text").attr("x", 0).attr("y", start.ry + 26).attr("text-anchor", "middle").attr("font-size", 12).attr("fill", col.ink)
    .text("a = equatorial radius, b = polar radius");

  // Meades Ranch and Tokyo pins
  const pinG = svg.append("g").style("opacity", 0).style("transition", fade);
  pinG.append("path").attr("d", `M${pin[0]},${pin[1]} l-7,-16 a8,8 0 1,1 14,0 z`).attr("fill", col.red).attr("stroke", "#fff");
  pinG.append("text").attr("x", pin[0] - 14).attr("y", pin[1] - 24).attr("text-anchor", "end").attr("font-size", 12).attr("fill", col.ink)
    .text("Meades Ranch, Kansas");
  const pinT = svg.append("g").style("opacity", 0).style("transition", fade);
  pinT.append("path").attr("d", `M${pinTokyo[0]},${pinTokyo[1]} l-7,-16 a8,8 0 1,1 14,0 z`).attr("fill", col.orange).attr("stroke", "#fff");
  pinT.append("text").attr("x", pinTokyo[0] + 14).attr("y", pinTokyo[1] - 24).attr("font-size", 12).attr("fill", col.ink)
    .text("Tokyo");

  // Optional caption line under the drawing
  let capEl = null;
  if (caption) {
    capEl = document.createElement("div");
    capEl.className = "datum-caption";
    wrap.appendChild(capEl);
  }

  // ---- Move everything to step s (1..6). Same rules as the lecture. ----
  function setStep(s) {
    s = Math.max(1, Math.min(6, Math.round(s)));
    const e = s <= 2 ? start : s === 3 ? nad27 : s <= 5 ? tokyo : g.wgs84;
    ell.style("opacity", s >= 2 ? 1 : 0).style("transform", `translate(${e.x}px, ${e.y}px)`);
    shape.style("transform", `scale(${e.rx / start.rx}, ${e.ry / start.ry})`);
    axes.style("opacity", s === 2 ? 1 : 0);
    pinG.style("opacity", s >= 3 ? 1 : 0);
    pinT.style("opacity", s >= 4 ? 1 : 0);
    sat.style("opacity", s >= 5 ? 1 : 0);
    ghost.style("opacity", s >= 4 ? 0.8 : 0);
    ghostTokyo.style("opacity", s === 6 ? 0.9 : 0);
    if (capEl) capEl.textContent = CAPTIONS[s - 1];
    wrap.dataset.step = s;
  }

  setStep(1);
  return {node: wrap, setStep};
}
