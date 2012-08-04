using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using OKHWR.Shape.Reco;

namespace OKHWR.Web.Init
{
  public class RecognizerContext
  {
    private static NNRecognizer _nnRecognizer;

    public static NNRecognizer GetNNRecognizer
    {
      get { return _nnRecognizer ?? (_nnRecognizer = new NNRecognizer()); }
    }

  }
}