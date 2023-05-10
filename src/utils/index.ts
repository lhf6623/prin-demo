import JsBarcode from "jsbarcode";

export interface ListType {
  key: string;
  base64: string;
  all_content: string;
}

export function getTextWidth(text: string, font: string = "bold 12pt arial") {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  context!.font = font;
  var metrics = context!.measureText(text);
  return Math.ceil(metrics.width);
}

export function textToBase64Barcode(
  text: string,
  prefix: string = "",
  opt: JsBarcode.Options
) {
  var canvas = document.createElement("canvas");
  const { _options } = JsBarcode(canvas, text, {
    textAlign: "right",
    ...opt,
  }) as unknown as {
    _options: Required<JsBarcode.Options>;
  };
  const { marginLeft, marginBottom, textMargin, margin } = _options;
  var ctx = canvas.getContext("2d");
  const h = canvas.height;
  const w = canvas.width;
  const textWidth = getTextWidth(prefix);
  ctx?.fillText(
    prefix,
    -(w - (marginLeft + textWidth + textMargin + margin)),
    h - marginBottom
  );
  return canvas.toDataURL("image/png");
}

export function printHtml(base64: string) {
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  // iframe.setAttribute("style", 'display: none')

  const img = document.createElement("img");
  img.src = base64;
  console.log(iframe.contentWindow);
  iframe.contentWindow!.document.head.innerHTML = `<style type="text/css" media="print">
  @page 
    {
        size: auto;   /* auto is the initial value */
        margin: 0mm;  /* this affects the margin in the printer settings */
    }
</style>`;
  iframe.contentWindow!.document.body.appendChild(img);
  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  setTimeout(() => {
    // document.body.removeChild(iframe);
  }, 1000);
}
