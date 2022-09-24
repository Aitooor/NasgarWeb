import Toasts from "../components/toasts.js";
import "./nav.js";

globalThis.Toasts = Toasts;

async function copyText(txt, { silent = false } = {}) {
  let copied = false;

  if(window.copy) {
    window.copy(txt);
    copied = true;
  } else
  if (!navigator.clipboard) {
    var textArea = document.createElement("textarea");
    textArea.value = txt;

    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand("copy");
      var msg = successful ? "successful" : "unsuccessful";
      copied = true;
    } catch (err) {
      console.error("Fallback error copying: ", err);
    }

    document.body.removeChild(textArea);
  } else {
    try {
      await navigator.clipboard.writeText(txt);
      copied = true;
    } catch (err) {
      console.log("Error copying: ", err);
    }
  }

  if (!silent && copied) {
    await Toasts.all(async (toast) => {
      if (toast.data.fired === "copy") return await toast.close();
      return;
    });

    new Toasts({
      title: "Copied to clipboard",
      body: "Text copied: <i> " + txt + " </i>",
      data: {
        fired: "copy",
      },
    }).show();
  }
}

function antiSpacesSplit(str: string, separator: string, limit?: number) {
  return str.split(separator, limit).map((s) => {
    return s.replace("^s+|s+$", "");
  });
}

document.querySelectorAll("[data-commons-onclick]").forEach(async (_elm) => {
  const elm = _elm as HTMLElement;

  elm.addEventListener("click", async () => {
    const dataAttr = elm.dataset.commonsOnclick;
    const dataParts = antiSpacesSplit(dataAttr, ",");
    if (dataParts[0] === "copy") {
      await copyText(dataParts[1]);
    } else if (dataParts[0] === "link") {
      window.open(dataParts[1], dataParts[2] || "_self");
    }
  });
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js");
}

globalThis.copyText = copyText;
globalThis.copyToClipboard = copyText;

const openOrg = window.open;

declare global {
    interface Window {
      copy?: (txt: string) => void;
    }

    type copyText = typeof copyText;
    type copyToClipboard = typeof copyText;
    function open(url: string, target?: string): Window;
  
}

globalThis.open = function (url, target = "_self") {
  return openOrg(url, target);
};
