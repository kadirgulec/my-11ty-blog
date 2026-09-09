/*
 * Animated dot grid for the hero, ported from the design project's
 * dotted-grid.jsx to dependency-free JS.
 *
 * The initials are rasterised into an offscreen canvas once per resize; the
 * alpha channel of that raster tells each dot whether it sits inside a
 * letterform, which is what makes the "KG" emerge out of the grid.
 *
 * Markup: <canvas data-dotted-grid data-text="KG"></canvas>
 */
(function () {
    "use strict";

    var clamp01 = function (v) { return Math.max(0, Math.min(1, v)); };
    var clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };
    var num = function (v, fallback) {
        var n = parseFloat(v);
        return isNaN(n) ? fallback : n;
    };
    var lerp = function (a, b, t) { return a + (b - a) * t; };
    var smoothstep = function (e0, e1, v) {
        var t = clamp01((v - e0) / (e1 - e0));
        return t * t * (3 - 2 * t);
    };

    function buildMask(width, height, text, fontFamily, anchorX, anchorY, inkHeight, inkWidth) {
        var c = document.createElement("canvas");
        c.width = Math.max(1, Math.floor(width));
        c.height = Math.max(1, Math.floor(height));
        var g = c.getContext("2d");
        if (!g) return null;

        // Space Grotesk's ink spans roughly 0.95em from ascender to descender,
        // so this is the em size that renders glyphs `inkHeight` tall.
        var size = inkHeight / 0.95;
        g.textAlign = "center";
        g.textBaseline = "middle";
        g.fillStyle = "#fff";
        for (var i = 0; i < 8; i++) {
            g.font = "700 " + size + "px " + fontFamily;
            var w = g.measureText(text).width;
            if (w <= inkWidth) break;
            size *= inkWidth / w;
        }
        g.font = "700 " + size + "px " + fontFamily;
        g.fillText(text, c.width * anchorX, c.height * anchorY);

        try {
            return g.getImageData(0, 0, c.width, c.height).data;
        } catch (e) {
            return null;
        }
    }

    function init(canvas) {
        var ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) return;

        var opts = {
            spacing: 20,
            baseRadius: 1.5,
            mouseRadius: 200,
            background: "#101418",
            text: canvas.dataset.text || "KG",
            // Fallbacks, used when there is nothing to align to.
            anchorX: num(canvas.dataset.anchorX, 0.72),
            anchorY: num(canvas.dataset.anchorY, 0.3),
            scale: num(canvas.dataset.scale, 0.46),
            // Selector of the element the initials should sit above and centre on.
            alignTo: canvas.dataset.alignTo || "",
            // Below this canvas width the letterform is dropped and only the
            // ambient dot field remains — see resolveAnchors/build.
            textMinWidth: num(canvas.dataset.textMinWidth, 0),
            fontFamily: "'Space Grotesk', system-ui, sans-serif",
            dotColor: "152,162,173",
            accentColor: "240,128,31"
        };

        var width = 0, height = 0, dots = [], mask = null, maskW = 0;
        var rafId = null, retry = null;
        var mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
        var reduceQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
        var hoverQuery = window.matchMedia ? window.matchMedia("(hover: hover)") : null;
        var reduce = reduceQuery ? reduceQuery.matches : false;

        // A touch device has no hover, so the only motion left would be the
        // ambient blink — not worth an rAF loop on someone's battery. Paint a
        // single static frame there, same as for prefers-reduced-motion.
        var still = reduce || !(hoverQuery ? hoverQuery.matches : true);
        function refreshMotion() {
            reduce = reduceQuery ? reduceQuery.matches : false;
            still = reduce || !(hoverQuery ? hoverQuery.matches : true);
        }

        function strengthAt(x, y) {
            if (!mask) return 0;
            var px = Math.floor(x), py = Math.floor(y);
            if (px < 0 || py < 0 || px >= maskW) return 0;
            var a = mask[(py * maskW + px) * 4 + 3];
            return a === undefined ? 0 : a / 255;
        }

        // The initials are pinned to a real element (the hero stat card) rather
        // than to a magic fraction: they centre on it horizontally and are sized
        // to the gap above it, so the mark stays in proportion at any viewport.
        function resolveMark(box) {
            var fallback = {
                x: opts.anchorX,
                y: opts.anchorY,
                inkHeight: height * opts.scale,
                inkWidth: width * 0.42
            };
            if (!opts.alignTo) return fallback;

            var target = document.querySelector(opts.alignTo);
            if (!target) return fallback;

            var t = target.getBoundingClientRect();
            if (!t.width || !t.height || !box.width || !box.height) return fallback;

            var gap = t.top - box.top;
            if (gap <= 0) return fallback;

            return {
                x: clamp01((t.left + t.width / 2 - box.left) / box.width),
                // Centred in the band between the top of the hero and the card,
                // so the mark reads as sitting above it rather than behind it.
                y: clamp(gap / 2 / box.height, 0.16, 0.5),
                inkHeight: gap * 0.74,
                inkWidth: t.width * 0.92
            };
        }

        function build() {
            if (retry != null) { cancelAnimationFrame(retry); retry = null; }

            var rect = canvas.getBoundingClientRect();
            var parent = canvas.parentElement;
            var prect = parent ? parent.getBoundingClientRect() : null;
            var w = rect.width || canvas.offsetWidth || (prect && prect.width) || 0;
            var h = rect.height || canvas.offsetHeight || (prect && prect.height) || 0;

            // The hero has no intrinsic height until its content lays out.
            if (w < 2 || h < 2) {
                retry = requestAnimationFrame(build);
                return;
            }

            width = w;
            height = h;
            var dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // On a narrow canvas the hero text spans the full width, so any large
            // glyph collides with it. Keep the ambient dots, drop the initials.
            var mark = resolveMark(rect.width ? rect : (prect || rect));
            mask = width >= opts.textMinWidth && mark.inkHeight >= 64
                ? buildMask(width, height, opts.text, opts.fontFamily, mark.x, mark.y, mark.inkHeight, mark.inkWidth)
                : null;
            maskW = Math.max(1, Math.floor(width));

            dots = [];
            for (var y = opts.spacing / 2; y < height; y += opts.spacing) {
                for (var x = opts.spacing / 2; x < width; x += opts.spacing) {
                    dots.push({
                        x: x,
                        y: y,
                        s: strengthAt(x, y),
                        phase: Math.random() * Math.PI * 2,
                        speed: 0.3 + Math.random(),
                        m: 0
                    });
                }
            }
            if (dots.length) draw(performance.now());
        }

        function draw(ms) {
            if (!width || !height || !dots.length) { build(); return; }

            var time = ms * 0.001;
            mouse.x = lerp(mouse.x, mouse.tx, 0.12);
            mouse.y = lerp(mouse.y, mouse.ty, 0.12);

            ctx.fillStyle = opts.background;
            ctx.fillRect(0, 0, width, height);

            for (var i = 0; i < dots.length; i++) {
                var dot = dots[i];
                var blink = still
                    ? 0.5
                    : Math.pow(Math.sin(time * (0.9 + dot.speed) + dot.phase + dot.x * 0.02 + dot.y * 0.016), 2);

                var target = 0;
                if (!still && mouse.active) {
                    var dx = dot.x - mouse.x, dy = dot.y - mouse.y;
                    var dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < opts.mouseRadius) {
                        var n = 1 - smoothstep(0, 1, dist / opts.mouseRadius);
                        target = n * n;
                    }
                }
                dot.m = still ? 0 : lerp(dot.m, target, 0.12);

                var lit = dot.s;
                var alpha = clamp01(
                    lerp(0.12 + blink * 0.06, 0.5 + blink * 0.22, lit) + dot.m * (lit > 0.5 ? 0.3 : 0.4)
                );
                var radius = opts.baseRadius + lit * 1.9 + dot.m * 1.1;
                var rgb = lit > 0.5 ? opts.accentColor : opts.dotColor;

                ctx.beginPath();
                ctx.fillStyle = "rgba(" + rgb + "," + alpha + ")";
                ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function tick(ms) {
            rafId = null;
            draw(ms);
            rafId = requestAnimationFrame(tick);
        }

        function start() {
            if (still) return;
            if (!dots.length) build();
            if (rafId == null) rafId = requestAnimationFrame(tick);
        }

        function stop() {
            if (rafId != null) { cancelAnimationFrame(rafId); rafId = null; }
        }

        // Listen on the window: the hero's content sits on top of the canvas,
        // so pointer events never reach the canvas element itself.
        function onMove(e) {
            var rect = canvas.getBoundingClientRect();
            var x = e.clientX - rect.left;
            var y = e.clientY - rect.top;
            var inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
            if (!inside) { mouse.active = false; return; }
            if (!mouse.active) { mouse.x = x; mouse.y = y; }
            mouse.tx = x;
            mouse.ty = y;
            mouse.active = true;
        }

        new ResizeObserver(build).observe(canvas);
        new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                entries[i].isIntersecting ? start() : stop();
            }
        }, { rootMargin: "128px" }).observe(canvas);

        function onMotionChange() {
            refreshMotion();
            if (still) { stop(); draw(performance.now()); } else { start(); }
        }
        if (reduceQuery && reduceQuery.addEventListener) reduceQuery.addEventListener("change", onMotionChange);
        if (hoverQuery && hoverQuery.addEventListener) hoverQuery.addEventListener("change", onMotionChange);
        document.addEventListener("visibilitychange", function () {
            document.hidden ? stop() : start();
        });
        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("blur", function () { mouse.active = false; });

        build();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
        start();
    }

    function boot() {
        var nodes = document.querySelectorAll("canvas[data-dotted-grid]");
        for (var i = 0; i < nodes.length; i++) init(nodes[i]);
    }

    document.readyState === "loading"
        ? document.addEventListener("DOMContentLoaded", boot)
        : boot();
})();
