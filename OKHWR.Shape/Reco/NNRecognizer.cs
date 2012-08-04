using System.Collections.Generic;
using OKHWR.Common.Common;
using OKHWR.Shape.FeatureExtraction;
using OKHWR.Shape.PreProc;
using OKHWR.Shape.Train;

namespace OKHWR.Shape.Reco
{
  public class NNRecognizer
  {
    private IList<TrainFeature> _trainList;
    private PointFloatShapeFeatureExtractor _featureExtractor;
    private PreProcessing _preProc;
    private int _numOfChoice = 5;

    public NNRecognizer()
    {
      _featureExtractor = new PointFloatShapeFeatureExtractor();
      _preProc = new PreProcessing();
    }

    public IList<RecoResult> Recognize(TraceGroup testTraceGroup)
    {
      var testPreProcTraceGroup = _preProc.PreProcess(testTraceGroup);
      var testFeature = _featureExtractor.ExtractFeature(testPreProcTraceGroup);

      var distanceList = new List<KeyValuePair<int, float>>();
      foreach (var train in _trainList)
      {
        var d = _featureExtractor.ComputeEuclideanDistance(train.ShapeFeatures, testFeature);
        distanceList.Add(new KeyValuePair<int, float>(train.ClassId, d));
      }

      distanceList.Sort((f1, f2) => f1.Value.CompareTo(f2.Value));

      var tempRecoResult = new List<RecoResult>();
      var sumSimiliarity = 0f;
      for (var i = 0; i < distanceList.Count; i++)
      {
        var foundDuplicated = tempRecoResult.Find(c => c.ShapeId == distanceList[i].Key);
        if (foundDuplicated == null)
        {
          sumSimiliarity += distanceList[i].Value;
          tempRecoResult.Add(new RecoResult { ShapeId = distanceList[i].Key, ConfidenceLevel = distanceList[i].Value });

          if (tempRecoResult.Count == _numOfChoice) break;
        }
      }

      for (var i = 0; i < _numOfChoice; i++)
      {
        tempRecoResult[i].ConfidenceLevel = (sumSimiliarity - tempRecoResult[i].ConfidenceLevel) / sumSimiliarity;
      }

      return tempRecoResult;
    }

    public void Train(string path)
    {
      var trainReco = new TrainRecognizer();
      _trainList = trainReco.Train(path);
    }
  }
}
