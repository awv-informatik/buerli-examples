type Vec = number[] | THREE.Vector3 | THREE.Euler

/**
 * Information about the fillet.
 */
export type FilletInfo = {
  /** Contains both start points of adjacent lines of control point. Actually both start points are equal to control point. */
  lineStarts: Vec[]
  /** Contains both end points of adjacent lines of control point. */
  lineEnds: Vec[]
  /** Control point of fillet. It's the point where both lines intersect. */
  control: Vec
}

/**
 * Point definition where the fillet will be added with a specified radius.
 */
export type FilletPoint = {
  /** Point where the corner of the polyline will be. */
  point: THREE.Vector3
  /** Radius of the fillet at the position of point. */
  radius: number
}

/**
 * Polyline of points and bulges. Bulges define the arc between the current and the next point.
 */
export type Polyline = {
  /** Points where the corners of the polyline will be. */
  points: THREE.Vector3[]
  /** Bulges which define the arcs. */
  bulges: number[]
}

/**
 * Calculates the including angle between two lines. The angle is measured from first to second line counterclockwise. If angle exceeds 180°, measuring is clockwise but negative angle
 * @param info Info contains information about lines
 */
const getIncludingAngle = (info: FilletInfo) => {
  // First line (line to point)
  const line1: THREE.Vector3 = (info.lineEnds[0] as THREE.Vector3)
    .clone()
    .sub(info.lineStarts[0] as THREE.Vector3)
    .normalize()

  // Second line (line from point)
  const line2: THREE.Vector3 = (info.lineEnds[1] as THREE.Vector3)
    .clone()
    .sub(info.lineStarts[1] as THREE.Vector3)
    .normalize()

  // Angle, measured from first line to second line counterclockwise.
  // If angle exceeds 180°, measuring is clockwise but negative angle
  const angle = Math.atan2(line1.x * line2.y - line1.y * line2.x, line1.x * line2.x + line1.y * line2.y)

  return angle
}

/**
 * Returns the adjacent points of the fillet arc. These are the points where fillet arc tangentially touches the lines.
 * @param info contains all information for the fillet, like start- and endpoints of adjacent lines and control point
 * @param radius radius of the fillet arc
 */
export const getTouchPoints = (info: FilletInfo, radius: number) => {
  const controlPos = info.control
  const linearTolerance = 1e-3

  const dirs = []
  const maxDists = []
  for (let i = 0; i < 2; i++) {
    const startPos = info.lineStarts[i] as THREE.Vector3
    const endPos = info.lineEnds[i] as THREE.Vector3
    const dir = endPos.clone().sub(startPos).normalize()
    const maxDist = endPos.distanceTo(controlPos as THREE.Vector3)
    dirs.push(dir)
    maxDists.push(maxDist)
  }

  if (radius + linearTolerance >= Math.min(maxDists[0], maxDists[1])) {
    return null // too large fillet
  }

  // Calculate distance from controlpt to touchpoint
  const scalar = Math.abs(radius / Math.tan(getIncludingAngle(info) / 2))

  return dirs.map(dir =>
    dir
      .clone()
      .multiplyScalar(scalar)
      .add(controlPos as THREE.Vector3),
  )
}

/**
 * Calculates and returns the including angle between the touchpoints of the fillet. Attention: It is the angle of touchpoints and center of fillet arc and not the one between touchpoints and control point.
 * @param info
 */
export const getIncludingBulgeAngle = (info: FilletInfo) => {
  // angle of first line, control point and second line
  const angle = getIncludingAngle(info)

  // Opposite angle of the angle which was calculated from control point and its adjacent lines
  const oppositeAngle = Math.PI - Math.abs(angle)
  const sign = angle / Math.abs(angle)

  return oppositeAngle * sign * -1 // -1 because of bulges definition
}
