namespace OKHWR.Common.Common
{
  public class CaptureDevice
  {
    public int SamplingRate { get; set; }
    public int XDpi { get; set; }
    public int YDpi { get; set; }
    public float Latency { get; set; }  //interval between the time of actual input to that of its registration

    public bool IsUniformSamplingRate { get; set; }
  }
}
