using System.Collections.Generic;
using OKHWR.Shape.FeatureExtraction;

namespace OKHWR.Shape.Train
{
  public class TrainFeature
  {
    public IList<PointFloatShapeFeature> ShapeFeatures { get; set; }

    public int ClassId { get; set; }
  }
}
