#include <napi.h>

extern "C" {
#include <libavcodec/avcodec.h>
}

Napi::Object InitAll(Napi::Env env, Napi::Object exports) {
  avcodec_find_decoder(AV_CODEC_ID_H264);
  return exports;
}

NODE_API_MODULE(addon, InitAll)
