using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using OKHWR.Common.Common;
using OKHWR.Shape.Reco;
using OKHWR.Web.Init;

namespace OKHWR.Web.Controllers
{
  public class RecognitionController : Controller
  {
    //
    // GET: /KhmerHandWritingRecognition/

    public ActionResult Index()
    {
      return View();
    }

    [HttpPost]
    public ActionResult Recognize(TraceGroup strokes)
    {
      //var aa = strokes.ToString();
      //var serializer = new JavaScriptSerializer();
      //var originalObject = serializer.Deserialize<TraceGroup>(strokes.ToString());
      var recognizer = RecognizerContext.GetNNRecognizer;
      var result = recognizer.Recognize(strokes);
      return Json(result, JsonRequestBehavior.AllowGet);

    }
  }
}
