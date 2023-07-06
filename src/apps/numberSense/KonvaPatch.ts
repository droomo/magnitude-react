import Konva from "konva";

export class CircleI extends Konva.Shape {
    _sceneFunc(context: Konva.Context) {

        const chord = this.attrs.radius * 0.4

        context.beginPath();

        // chord length d = 2 * r * sin(theta / 2); theta为弦对应的圆心角
        const tempAngle = Math.asin(chord / this.attrs.radius * 0.5)

        context.arc(0, 0, this.attrs.radius || 0,
            tempAngle, // start angle
            -tempAngle, // end angle
        );

        context.lineTo(0, -chord / 2)
        context.lineTo(0, chord / 2)

        context.closePath();
        context.fillStrokeShape(this);

    }
}

CircleI.prototype._centroid = true;
CircleI.prototype.className = 'CircleI';
CircleI.prototype._attrsAffectingSize = ['radius', 'direction'];

export class CircleIPair extends Konva.Shape {
    _sceneFunc(context: Konva.Context) {

        const chord = this.attrs.radius * 0.4

        context.beginPath();

        const tempAngle = Math.asin(chord / this.attrs.radius * 0.5)

        context.arc(0, 0, this.attrs.radius || 0,
            this.attrs.direction + tempAngle, // start angle
            this.attrs.direction - tempAngle, // end angle
        );

        context.lineTo(chord / 2 * Math.sin(this.attrs.direction), -chord / 2 * Math.cos(this.attrs.direction))
        context.lineTo(-chord / 2 * Math.sin(this.attrs.direction), chord / 2 * Math.cos(this.attrs.direction))

        context.closePath();

        context.fillStrokeShape(this);


        // move to next circle position
        const pairD = 14 / 5 * this.attrs.radius
        context.translate(
            pairD * Math.cos(this.attrs.direction),
            pairD * Math.sin(this.attrs.direction));
        context.beginPath();

        const tempAngle2 = Math.asin(chord / this.attrs.radius * 0.5) + Math.PI

        context.arc(0, 0, this.attrs.radius || 0,
            this.attrs.direction + tempAngle2, // start angle
            this.attrs.direction - tempAngle2, // end angle
        );

        context.lineTo(
            chord / 2 * Math.sin(this.attrs.direction + Math.PI),
            -chord / 2 * Math.cos(this.attrs.direction + Math.PI)
        )
        context.lineTo(
            -chord / 2 * Math.sin(this.attrs.direction + Math.PI),
            chord / 2 * Math.cos(this.attrs.direction + Math.PI)
        )

        context.closePath();

        context.fillStrokeShape(this);

    }
}
CircleIPair.prototype._centroid = true;
CircleIPair.prototype.className = 'CircleIPair';
CircleIPair.prototype._attrsAffectingSize = ['radius', 'direction'];
