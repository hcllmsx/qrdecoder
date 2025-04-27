// popup.js
const scanBtn = document.getElementById('scanBtn');
const delayBtn = document.getElementById('delayBtn');
const countdown = document.getElementById('countdown');
const loading = document.getElementById('loading');
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');

let countdownTimer = null;

function showLoading(show) {
  loading.style.display = show ? 'block' : 'none';
}
function showError(msg) {
  errorDiv.textContent = msg;
  errorDiv.style.display = 'block';
}
function hideError() {
  errorDiv.style.display = 'none';
}
function showResult(text) {
  resultDiv.innerHTML = '';
  if (!text) return;
  // 判断是否网址
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/\?%&=]*)?$/i;
  resultDiv.textContent = text;
  const btnCopy = document.createElement('button');
  btnCopy.textContent = '一键复制';
  btnCopy.className = 'btn';
  btnCopy.onclick = () => {
    navigator.clipboard.writeText(text).then(() => {
      btnCopy.textContent = '已复制!';
      setTimeout(()=>btnCopy.textContent='一键复制', 1200);
    });
  };
  resultDiv.appendChild(document.createElement('br'));
  resultDiv.appendChild(btnCopy);
  if (urlPattern.test(text)) {
    const btnOpen = document.createElement('button');
    btnOpen.textContent = '新标签页打开';
    btnOpen.className = 'btn secondary';
    btnOpen.onclick = () => {
      let url = text;
      if (!/^https?:\/\//i.test(url)) url = 'http://' + url;
      window.open(url, '_blank');
    };
    resultDiv.appendChild(btnOpen);
  }
  resultDiv.style.display = 'block';
}
function hideResult() {
  resultDiv.style.display = 'none';
}

function doScan(delay = 0) {
  hideResult();
  hideError();
  showLoading(false);
  if (delay > 0) {
    let sec = delay;
    countdown.textContent = sec + ' 秒';
    countdown.style.display = 'inline';
    countdownTimer = setInterval(() => {
      sec--;
      countdown.textContent = sec > 0 ? sec + ' 秒' : '';
      if (sec <= 0) {
        clearInterval(countdownTimer);
        countdown.style.display = 'none';
        realScan();
      }
    }, 1000);
  } else {
    realScan();
  }
}

function realScan() {
  showLoading(true);
  chrome.runtime.sendMessage({action: 'captureScreenshot'}, (response) => {
    if (!response || response.error) {
      showLoading(false);
      showError(response ? response.error : '插件后台无响应');
      return;
    }
    // 用canvas和jsQR解码
    decodeQRCodeFromDataUrl(response.dataUrl).then(result => {
      showLoading(false);
      if (result.error) {
        showError(result.error);
      } else if (result.multi) {
        showMultiResult(result.multi);
      } else {
        showResult(result.data);
      }
    });
  });
}

// 多二维码内容展示
function showMultiResult(arr) {
  resultDiv.innerHTML = '';
  const uniq = Array.from(new Set(arr));
  if (uniq.length === 1 && arr.length > 1) {
    // 多个二维码内容相同
    resultDiv.innerHTML = `<div style='color:#888;font-size:13px;margin-bottom:8px;'>检测到多个二维码，内容均相同：</div>`;
    showResult(uniq[0]);
  } else if (uniq.length > 1) {
    resultDiv.innerHTML = `<div style='color:#888;font-size:13px;margin-bottom:8px;'>检测到多个二维码，内容如下：</div>`;
    uniq.forEach((text, idx) => {
      const box = document.createElement('div');
      box.style = 'margin-bottom:10px;padding:7px 8px;background:#f8f8fa;border-radius:4px;';
      box.innerHTML = `<div style='font-size:13px;color:#333;margin-bottom:4px;'>二维码${idx+1}：</div>`;
      // 复用showResult逻辑
      let tmp = document.createElement('div');
      resultDiv.appendChild(box);
      showResult.call({resultDiv:box}, text);
    });
    resultDiv.style.display = 'block';
  } else {
    showResult(arr[0]);
  }
}

// 多二维码检测
function decodeQRCodeFromDataUrl(dataUrl) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = function() {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      try {
        // 1. 先整体全图扫描
        const first = window.jsQR(imageData.data, img.width, img.height);
        if (first && first.data) {
          resolve({ data: first.data });
          return;
        }
        // 2. 多区域滑窗扫描
        const results = [];
        const step = Math.max(120, Math.floor(Math.min(img.width, img.height) / 3)); // 自适应窗口
        for(let y=0; y<=img.height-step; y+=step/2) {
          for(let x=0; x<=img.width-step; x+=step/2) {
            const sub = ctx.getImageData(x, y, step, step);
            const code = window.jsQR(sub.data, step, step);
            if (code && code.data) {
              results.push({data: code.data, x: x+code.location.topLeftCorner.x, y: y+code.location.topLeftCorner.y});
            }
          }
        }
        // 去重（内容+位置）
        const uniq = [];
        results.forEach(r => {
          if (!uniq.some(u => u.data === r.data && Math.abs(u.x-r.x)<10 && Math.abs(u.y-r.y)<10)) {
            uniq.push(r);
          }
        });
        if (uniq.length === 0) {
          resolve({error: '未检测到二维码'});
        } else if (uniq.length === 1) {
          resolve({data: uniq[0].data});
        } else {
          resolve({multi: uniq.map(u=>u.data)});
        }
      } catch (e) {
        resolve({error: '解码异常: ' + e.message});
      }
    };
    img.onerror = function() {
      resolve({error: '图片加载失败'});
    };
    img.src = dataUrl;
  });
}




scanBtn.onclick = () => doScan(0);
delayBtn.onclick = () => doScan(3);
