from manim import *

class ConceptExplanation(Scene):
    def construct(self):
        # Title
        title = Text("Linear Approximation", font_size=48, color=BLUE)
        title.to_edge(UP)
        self.play(Write(title), run_time=1.5)
        self.wait(0.5)
        
        # Core idea text
        idea = Text("Use a tangent line to approximate a curve near a point", font_size=28, color=YELLOW)
        idea.next_to(title, DOWN, buff=0.3)
        self.play(FadeIn(idea), run_time=1)
        self.wait(0.8)
        
        self.play(FadeOut(idea), run_time=0.5)
        
        # Create axes
        axes = Axes(
            x_range=[-1, 5, 1],
            y_range=[-1, 4, 1],
            x_length=8,
            y_length=5
        )
        axes.shift(DOWN * 0.5)
        
        # Labels
        x_label = MathTex("x", font_size=30).next_to(axes.c2p(5, 0), RIGHT, buff=0.1)
        y_label = MathTex("y", font_size=30).next_to(axes.c2p(0, 4), UP, buff=0.1)
        
        self.play(Create(axes), Write(x_label), Write(y_label), run_time=1.5)
        
        # Draw the curve f(x) = sqrt(x)
        curve = axes.plot(lambda x: x**0.5, x_range=[0.01, 4.5], color=BLUE)
        curve_label = MathTex(r"f(x) = \sqrt{x}", font_size=28, color=BLUE)
        curve_label.next_to(axes.c2p(4, 2), RIGHT, buff=0.2)
        
        self.play(Create(curve), Write(curve_label), run_time=1.5)
        self.wait(0.5)
        
        # Point of tangency at x = 1
        a = 1
        f_a = 1  # sqrt(1) = 1
        
        # Create point on curve
        point = Dot(axes.c2p(a, f_a), color=YELLOW, radius=0.12)
        point_label = MathTex(r"(1, 1)", font_size=24, color=YELLOW)
        point_label.next_to(point, UL, buff=0.15)
        
        self.play(Create(point), Write(point_label), run_time=1)
        
        # Show the tangent line concept
        tangent_text = Text("Tangent line at x = 1", font_size=24, color=GREEN)
        tangent_text.to_corner(UR).shift(DOWN * 1.5)
        self.play(Write(tangent_text), run_time=1)
        
        # Derivative of sqrt(x) is 1/(2*sqrt(x)), at x=1 it's 0.5
        slope = 0.5
        
        # Tangent line: y - 1 = 0.5(x - 1), so y = 0.5x + 0.5
        tangent = axes.plot(lambda x: 0.5 * x + 0.5, x_range=[-0.5, 4.5], color=GREEN)
        
        self.play(Create(tangent), run_time=1.5)
        self.wait(0.5)
        
        # Show the linear approximation formula
        self.play(FadeOut(tangent_text), run_time=0.5)
        
        formula_box = Rectangle(width=6, height=1.8, color=WHITE)
        formula_box.to_corner(UR).shift(DOWN * 0.3 + LEFT * 0.3)
        
        formula = MathTex(r"L(x) = f(a) + f'(a)(x - a)", font_size=28, color=WHITE)
        formula.move_to(formula_box.get_center()).shift(UP * 0.3)
        
        formula_specific = MathTex(r"L(x) = 1 + \frac{1}{2}(x - 1)", font_size=28, color=GREEN)
        formula_specific.next_to(formula, DOWN, buff=0.3)
        
        self.play(Create(formula_box), run_time=0.5)
        self.play(Write(formula), run_time=1.5)
        self.play(Write(formula_specific), run_time=1.5)
        self.wait(0.5)
        
        # Now show approximation at x = 1.2
        x_approx = 1.21
        actual_value = x_approx ** 0.5  # ~1.1
        approx_value = 0.5 * x_approx + 0.5  # = 1.105
        
        # Vertical line at x = 1.2
        vert_line = DashedLine(
            start=axes.c2p(x_approx, 0),
            end=axes.c2p(x_approx, 1.3),
            color=ORANGE
        )
        
        x_label_approx = MathTex(r"x = 1.21", font_size=22, color=ORANGE)
        x_label_approx.next_to(axes.c2p(x_approx, 0), DOWN, buff=0.15)
        
        self.play(Create(vert_line), Write(x_label_approx), run_time=1)
        
        # Point on curve (actual)
        actual_point = Dot(axes.c2p(x_approx, actual_value), color=BLUE, radius=0.1)
        # Point on tangent (approximation)
        approx_point = Dot(axes.c2p(x_approx, approx_value), color=GREEN, radius=0.1)
        
        self.play(Create(actual_point), Create(approx_point), run_time=1)
        
        # Labels for the values
        actual_label = MathTex(r"\sqrt{1.21} = 1.1", font_size=22, color=BLUE)
        actual_label.next_to(actual_point, RIGHT, buff=0.2)
        
        approx_label = MathTex(r"L(1.21) = 1.105", font_size=22, color=GREEN)
        approx_label.next_to(approx_point, LEFT, buff=0.2)
        
        self.play(Write(actual_label), run_time=1)
        self.play(Write(approx_label), run_time=1)
        self.wait(0.5)
        
        # Show error
        error_line = Line(
            start=axes.c2p(x_approx, actual_value),
            end=axes.c2p(x_approx, approx_value),
            color=RED
        )
        error_label = MathTex(r"\text{Error} \approx 0.005", font_size=22, color=RED)
        error_label.next_to(error_line, RIGHT, buff=0.3)
        
        self.play(Create(error_line), Write(error_label), run_time=1)
        self.wait(0.5)
        
        # Clear for key insight
        self.play(
            FadeOut(vert_line), FadeOut(x_label_approx),
            FadeOut(actual_point), FadeOut(approx_point),
            FadeOut(actual_label), FadeOut(approx_label),
            FadeOut(error_line), FadeOut(error_label),
            run_time=1
        )
        
        # Show that approximation gets worse further from point
        #
