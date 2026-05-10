from __future__ import annotations

import argparse
import json
import math
from dataclasses import dataclass
from pathlib import Path

from manim import (
    DOWN,
    UP,
    Circle,
    FadeIn,
    ManimColor,
    Polygon,
    Scene,
    Text,
    VGroup,
    config,
    rate_functions,
)


CONFIG_PATH = Path(__file__).with_name("logo-intro.config.json")
PENTAGON_MIDPOINT_RATIO = math.cos(math.pi / 5)


@dataclass(frozen=True)
class Dot:
    x: float
    y: float
    ring: int
    index: int
    color: str
    radius: float


def load_intro_config() -> dict:
    return json.loads(CONFIG_PATH.read_text(encoding="utf8"))


def ring_radius(ring: int, first_radius: float, spacing: float) -> float:
    return first_radius + (ring - 1) * spacing


def linear_radii(geometry: dict) -> list[float]:
    radii = [geometry["firstRadius"]]

    for ring in range(2, geometry["rings"] + 1):
        step = geometry.get("outerSpacing", geometry["spacing"]) if ring == geometry["rings"] else geometry["spacing"]
        radii.append(radii[-1] + step)

    return radii


def resolved_geometry(geometry: dict) -> dict:
    if geometry.get("construction") not in {"inscribed", "linear"}:
        return {**geometry, "radii": linear_radii(geometry)}

    rings = geometry["rings"]
    return {
        **geometry,
        "radii": [
            geometry["outerRadius"] * PENTAGON_MIDPOINT_RATIO ** (rings - index - 1)
            if geometry["construction"] == "inscribed"
            else geometry["outerRadius"] * ((index + 1) / rings)
            for index in range(rings)
        ],
    }


def resolved_ring_radius(ring: int, geometry: dict) -> float:
    if "radii" in geometry:
        return geometry["radii"][ring - 1]

    return ring_radius(ring, geometry["firstRadius"], geometry["spacing"])


def lerp(start: float, end: float, alpha: float) -> float:
    return start + (end - start) * alpha


def interpolated_geometry(intro_config: dict, alpha: float) -> dict:
    final = resolved_geometry(intro_config["finalGeometry"])
    initial = resolved_geometry({**intro_config["initialGeometry"], **{
        "rings": final["rings"],
        "innerRings": final["innerRings"],
    }})

    geometry = dict(final)
    geometry["radii"] = [
        lerp(initial["radii"][index], resolved_ring_radius(index + 1, final), alpha)
        for index in range(final["rings"])
    ]
    geometry["circleRadius"] = lerp(initial["circleRadius"], final["circleRadius"], alpha)
    geometry["middleCircleRadius"] = lerp(
        initial["circleRadius"],
        final.get("middleCircleRadius", final["circleRadius"]),
        alpha,
    )
    geometry["outerCircleRadius"] = lerp(
        initial["circleRadius"],
        final.get("outerCircleRadius", final["circleRadius"]),
        alpha,
    )
    geometry["rotation"] = lerp(initial["rotation"], final["rotation"], alpha)
    geometry["ringTwist"] = lerp(initial["ringTwist"], final["ringTwist"], alpha)

    return geometry


def polar_point(radius: float, angle: float) -> tuple[float, float]:
    # Match the SVG preview coordinate system: positive Y points downward.
    return math.cos(angle) * radius, -math.sin(angle) * radius


def pentagon_vertices(ring: int, geometry: dict) -> list[tuple[float, float]]:
    base_rotation = math.radians(geometry["rotation"])
    ring_twist = math.radians(geometry["ringTwist"])
    radius = resolved_ring_radius(ring, geometry)
    rotation = base_rotation + (ring - 1) * ring_twist

    return [
        polar_point(radius, rotation + index * math.tau / 5)
        for index in range(5)
    ]


def ring_points(ring: int, geometry: dict) -> list[tuple[float, float]]:
    vertices = pentagon_vertices(ring, geometry)
    points = []

    for index, start in enumerate(vertices):
        end = vertices[(index + 1) % len(vertices)]
        for step in range(ring):
            amount = step / ring
            points.append(
                (
                    start[0] + (end[0] - start[0]) * amount,
                    start[1] + (end[1] - start[1]) * amount,
                )
            )

    return points


def build_dots(intro_config: dict, geometry: dict | None = None) -> list[Dot]:
    geometry = geometry or intro_config["finalGeometry"]
    final_geometry = resolved_geometry(intro_config["finalGeometry"])
    palette = intro_config["palette"]
    dots = [Dot(0, 0, 0, 0, palette["center"], geometry["circleRadius"])]

    for ring in range(1, final_geometry["rings"] + 1):
        if ring <= final_geometry["innerRings"]:
            color = palette["inner"]
        elif ring == final_geometry["rings"]:
            color = palette["outer"]
        else:
            color = palette["middle"]

        radius = (
            geometry.get("outerCircleRadius", geometry["circleRadius"])
            if ring == final_geometry["rings"]
            else geometry.get("middleCircleRadius", geometry["circleRadius"])
            if ring > final_geometry["innerRings"]
            else geometry["circleRadius"]
        )

        for index, point in enumerate(ring_points(ring, geometry)):
            dots.append(Dot(point[0], point[1], ring, index, color, radius))

    return dots


def build_guides(intro_config: dict, scale: float) -> VGroup:
    geometry = interpolated_geometry(intro_config, 0)
    animation = intro_config["animation"]
    palette = intro_config["palette"]
    guides = VGroup()

    for ring in range(1, geometry["rings"] + 1):
        vertices = [
            [x * scale, y * scale, 0]
            for x, y in pentagon_vertices(ring, geometry)
        ]
        guide = Polygon(
            *vertices,
            color=ManimColor(palette["guide"]),
            stroke_width=2.4,
            fill_opacity=0,
            stroke_opacity=animation["startGuideOpacity"],
        )
        guide.target_opacity = animation["guideOpacity"]
        guides.add(guide)

    return guides


def build_final_guides(intro_config: dict, scale: float) -> VGroup:
    final_config = {**intro_config, "initialGeometry": intro_config["finalGeometry"]}
    return build_guides(final_config, scale)


def build_dot_mobjects(intro_config: dict, scale: float) -> list[tuple[Dot, Circle]]:
    geometry = interpolated_geometry(intro_config, 0)
    mobjects = []

    for dot in build_dots(intro_config, geometry):
        circle = Circle(
            radius=dot.radius * scale,
            color=ManimColor(dot.color),
            fill_color=ManimColor(dot.color),
            fill_opacity=1,
            stroke_width=0,
        )
        circle.move_to([dot.x * scale, dot.y * scale, 0])
        mobjects.append((dot, circle))

    return mobjects


class NumberGardenLogoIntro(Scene):
    def construct(self):
        intro_config = load_intro_config()
        final_geometry = intro_config["finalGeometry"]
        initial_geometry = intro_config["initialGeometry"]
        animation = intro_config["animation"]
        palette = intro_config["palette"]
        text_config = intro_config["text"]

        self.camera.background_color = ManimColor(intro_config["backgroundColor"])

        initial_geometry = resolved_geometry({**initial_geometry, **{
            "rings": final_geometry["rings"],
            "innerRings": final_geometry["innerRings"],
        }})
        max_radius = resolved_ring_radius(final_geometry["rings"], final_geometry)
        initial_radius = (
            resolved_ring_radius(final_geometry["rings"], initial_geometry)
            + initial_geometry["circleRadius"]
        )
        total_radius = max(max_radius + final_geometry["circleRadius"], initial_radius)
        scale = 2.05 / total_radius

        guides = build_guides(intro_config, scale)
        final_guides = build_final_guides(intro_config, scale)
        dot_mobjects = build_dot_mobjects(intro_config, scale)
        dots = VGroup(*[circle for _, circle in dot_mobjects])
        logo = VGroup(guides, dots).move_to(UP * 0.55)
        self.add(logo)

        final_dot_mobjects = build_dot_mobjects(
            {**intro_config, "initialGeometry": final_geometry},
            scale,
        )

        morphs = []
        for (_, circle), (_, final_circle) in zip(dot_mobjects, final_dot_mobjects):
            morphs.append(
                circle.animate(
                    run_time=animation["transitionDuration"],
                    rate_func=rate_functions.smooth,
                ).become(final_circle)
            )
        for guide, final_guide in zip(guides, final_guides):
            morphs.append(
                guide.animate(
                    run_time=animation["transitionDuration"],
                    rate_func=rate_functions.smooth,
                ).become(final_guide)
            )

        elapsed = 0
        transition_duration = animation["transitionDuration"]
        self.play(*morphs, run_time=transition_duration)
        elapsed += transition_duration

        if text_config["showWordmark"]:
            wordmark = Text(
                text_config["wordmark"],
                font="Georgia",
                color=ManimColor(palette["wordmark"]),
                weight="BOLD",
            ).scale(0.52)
            wordmark.next_to(logo, DOWN, buff=0.44)

            tagline = Text(
                text_config["tagline"],
                font="Avenir Next",
                color=ManimColor(palette["tagline"]),
            ).scale(0.24)
            tagline.next_to(wordmark, DOWN, buff=0.16)

            wordmark_delay = text_config.get("wordmarkDelay", transition_duration + 0.45)
            if wordmark_delay > elapsed:
                self.wait(wordmark_delay - elapsed)
                elapsed = wordmark_delay

            self.play(FadeIn(wordmark, shift=DOWN * 0.12), run_time=0.6)
            elapsed += 0.6

            tagline_delay = text_config.get("taglineDelay", elapsed)
            if tagline_delay > elapsed:
                self.wait(tagline_delay - elapsed)
                elapsed = tagline_delay

            self.play(FadeIn(tagline, shift=DOWN * 0.08), run_time=0.45)
            elapsed += 0.45

        self.wait(intro_config["holdDuration"])


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Render The Number Garden logo intro with Manim.")
    parser.add_argument("--quality", default="h", choices=["l", "m", "h", "p", "k"])
    args = parser.parse_args()
    config.quality = {
        "l": "low_quality",
        "m": "medium_quality",
        "h": "high_quality",
        "p": "production_quality",
        "k": "fourk_quality",
    }[args.quality]
