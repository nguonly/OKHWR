using System;
using System.Drawing;

namespace OKHWR.Common.Common
{
  public class PenPoint
  {
    public PenPoint()
    {
      
    }

    public PenPoint(float x, float y)
    {
      X = x;
      Y = y;
    }

    public float X { get; set; }
    public float Y { get; set; }

    public Point ToPoint()
    {
      return new Point(Convert.ToInt32(X), Convert.ToInt32(Y));
    }
  }
}
