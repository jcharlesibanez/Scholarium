from manim import *

class ConceptExplanation(Scene):
    def construct(self):
        title = Text("Linked List", font_size=24, color=WHITE)
        title.to_edge(UP, buff=0.5)
        self.play(Write(title, run_time=1.5))
        self.wait(0.5)

        rect1 = Rectangle(width=3, height=2, color=BLUE)
        rect1.set_fill(BLUE, opacity=0.2)
        text1 = Text("A", font_size=24, color=WHITE)
        node1 = VGroup(rect1, text1)
        node1.move_to(4*LEFT)

        rect2 = Rectangle(width=3, height=2, color=BLUE)
        rect2.set_fill(BLUE, opacity=0.2)
        text2 = Text("B", font_size=24, color=WHITE)
        node2 = VGroup(rect2, text2)
        node2.move_to(ORIGIN)

        rect3 = Rectangle(width=3, height=2, color=BLUE)
        rect3.set_fill(BLUE, opacity=0.2)
        text3 = Text("C", font_size=24, color=WHITE)
        node3 = VGroup(rect3, text3)
        node3.move_to(4*RIGHT)

        self.play(FadeIn(node1), FadeIn(node2), FadeIn(node3), run_time=1.5)
        self.wait(0.5)

        arrow1 = Arrow(start=2.5*LEFT, end=1.5*LEFT, color=WHITE, buff=0)
        arrow2 = Arrow(start=1.5*RIGHT, end=2.5*RIGHT, color=WHITE, buff=0)
        self.play(Create(arrow1), Create(arrow2), run_time=1)
        self.wait(0.5)

        self.play(ShowPassingFlash(arrow1, run_time=1), ShowPassingFlash(arrow2, run_time=1), run_time=1)
        self.wait(0.5)

        pointer = Arrow(start=4*LEFT+2.5*UP, end=4*LEFT+1.2*UP, color=YELLOW, buff=0)
        head_label = Text("head", font_size=24, color=YELLOW)
        head_label.next_to(pointer, UP, buff=0.5)
        self.play(FadeIn(pointer), FadeIn(head_label), run_time=1)
        self.wait(0.5)

        question = Text("First node?", font_size=24, color=WHITE)
        question.move_to(3*DOWN)
        self.play(FadeIn(question), run_time=1)
        self.wait(0.5)

        self.play(Indicate(node1, run_time=1), run_time=1)
        self.wait(0.5)

        answer = Text("A is first", font_size=24, color=YELLOW)
        answer.move_to(3*DOWN)
        self.play(ReplacementTransform(question, answer, run_time=1.2))
        self.wait(0.5)

        self.play(pointer.animate.shift(4*RIGHT), head_label.animate.shift(4*RIGHT), run_time=1)
        self.wait(0.5)
        self.play(pointer.animate.shift(4*RIGHT), head_label.animate.shift(4*RIGHT), run_time=1)
        self.wait(0.5)

        insert_text = Text("Insert X", font_size=24, color=WHITE)
        insert_text.move_to(3*DOWN)
        self.play(ReplacementTransform(answer, insert_text, run_time=1.2))
        self.wait(0.5)

        self.play(Indicate(node2, run_time=1), run_time=1)
        self.wait(0.5)

        self.play(node3.animate.shift(4*RIGHT), run_time=1)
        arrow2_long = Arrow(start=1.5*RIGHT, end=6.5*RIGHT, color=WHITE, buff=0)
        self.play(Transform(arrow2, arrow2_long, run_time=1))
        self.wait(0.5)

        rect4 = Rectangle(width=3, height=2, color=GREEN)
        rect4.set_fill(GREEN, opacity=0.2)
        text4 = Text("X", font_size=24, color=WHITE)
        node4 = VGroup(rect4, text4)
        node4.move_to(4*RIGHT)
        self.play(FadeIn(node4), run_time=1)
        self.wait(0.5)

        arrow2_new = Arrow(start=1.5*RIGHT, end=2.5*RIGHT, color=WHITE, buff=0)
        arrow3 = Arrow(start=5.5*RIGHT, end=6.5*RIGHT, color=WHITE, buff=0)
        self.play(FadeOut(arrow2), FadeIn(arrow2_new), FadeIn(arrow3), run_time=1.2)
        self.wait(0.5)

        self.play(Circumscribe(node4, color=YELLOW, run_time=1.5), run_time=1.5)
        self.wait(0.5)

        self.play(FadeOut(insert_text), run_time=1)
        self.wait(0.8)
