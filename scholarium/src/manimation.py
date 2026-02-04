from manim import *

class NumberLines(Scene):
    def construct(self):
        top=NumberLine(x_range=[-5,5,1], length=10)
        bottom=NumberLine(x_range=[-5,5,1], length=10).next_to(top,DOWN,buff=1)
        dot_top=Dot(top.number_to_point(-5))
        dot_bottom=Dot(bottom.number_to_point(5))
        self.add(top,bottom,dot_top,dot_bottom)
        self.play(
            dot_top.animate.move_to(top.number_to_point(5)),
            dot_bottom.animate.move_to(bottom.number_to_point(-5)),
            run_time=60,
            rate_func=linear
        )
