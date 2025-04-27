// 用于后台区域截图裁剪+二维码识别，依赖 jsQR
function dataURLToBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){ u8arr[n] = bstr.charCodeAt(n); }
  return new Blob([u8arr], {type:mime});
}

async function cropAndDecodeQRCode(dataUrl, x, y, w, h) {
  return new Promise((resolve) => {
    try {
      createImageBitmap(dataURLToBlob(dataUrl)).then(bitmap => {
        let canvas, ctx;
        if (typeof OffscreenCanvas !== 'undefined') {
          canvas = new OffscreenCanvas(w, h);
          ctx = canvas.getContext('2d');
        } else {
          canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          ctx = canvas.getContext('2d');
        }
        ctx.drawImage(bitmap, x, y, w, h, 0, 0, w, h);
        let imageData = ctx.getImageData(0, 0, w, h);
        // jsQR 必须已全局可用
        if (typeof jsQR !== 'function' && typeof self.importScripts === 'function') {
          importScripts('src/jsQR.js');
        }
        try {
          const code = jsQR(imageData.data, w, h);
          if (code && code.data) {
            resolve({data: code.data});
          } else {
            // 尝试滑窗多区域识别
            const results = [];
            const step = Math.max(120, Math.floor(Math.min(w, h) / 3));
            for(let yy=0; yy<=h-step; yy+=step/2) {
              for(let xx=0; xx<=w-step; xx+=step/2) {
                const sub = ctx.getImageData(xx, yy, step, step);
                const codeSub = jsQR(sub.data, step, step);
                if (codeSub && codeSub.data) {
                  results.push(codeSub.data);
                }
              }
            }
            const uniq = Array.from(new Set(results));
            if (uniq.length === 0) {
              resolve({error: '未检测到二维码'});
            } else if (uniq.length === 1) {
              resolve({data: uniq[0]});
            } else {
              resolve({multi: uniq});
            }
          }
        } catch (e) {
          resolve({error: '解码异常: ' + e.message});
        }
      }).catch(() => {
        resolve({error: '图片加载失败'});
      });
    } catch (e) {
      resolve({error: '后台异常: ' + e.message});
    }
  });
}
