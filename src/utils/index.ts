import type { BaseOptions } from "jsbarcode";
import JsBarcode from "jsbarcode";
import { Ref, ref, onMounted } from "vue";
import { http } from "@tauri-apps/api";
import { RemovableRef } from "@vueuse/core";

export interface ListType {
  key: string;
  code: string;
  base64: string;
  all_content: string;
}

export interface StateOptions extends BaseOptions {
  imgWidth: number;
}

/**
 * 获取文字的宽度
 * @param text 目标文字
 * @param font 文字样式
 * @returns
 */
export function getTextWidth(text: string, font: string = "bold 12pt arial") {
  var canvas = document.createElement("canvas");
  var context = canvas.getContext("2d");
  context!.font = font;
  var metrics = context!.measureText(text);
  return Math.ceil(metrics.width);
}

/**
 * 获取二维码 在左下角添加文字
 * @param text 二维码的文字
 * @param prefix 左下角文字
 * @param opt JsBarcode 配置
 * @returns
 */
export function textToBase64Barcode(
  text: string,
  prefix: string = "",
  opt: BaseOptions
) {
  var canvas = document.createElement("canvas");
  const { _options } = JsBarcode(canvas, text, {
    textAlign: "right",
    ...opt,
  }) as unknown as {
    _options: Required<BaseOptions>;
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

/**
 * 打印
 * @param base64 图片base64数据
 * @param opt 打印配置
 */
export function printHtml(base64: string, opt: StateOptions) {
  const { imgWidth } = opt;
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  iframe.setAttribute("style", "display: none");

  const img = document.createElement("img");
  img.src = base64;
  img.width = imgWidth;
  // 这个样式是打印页面的样式
  iframe.contentWindow!.document.head.innerHTML = `
  <style type="text/css" media="print">
    @page {
      size: auto;   /* auto is the initial value */
      margin: 0mm;  /* this affects the margin in the printer settings */
    }
  </style>
  <style>
    *{
      padding: 0;
      margin: 0;
    }
  </style>
`;
  iframe.contentWindow!.document.body.appendChild(img);
  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();

  setTimeout(() => {
    document.body.removeChild(iframe);
  }, 1000);
}

/**
 * 获取数据列表
 * @param urlState 
 * @param state 
 * @returns 
 */
export const useGetList = (
  urlState: Ref<{ url: string; isUrl: boolean }>,
  state: RemovableRef<StateOptions>
) => {
  const p_regex = /(?<=<p>).*?(?=<\/p>)/g;
  const k_regex = /\(([^)]+)\)/;
  const load = ref("请点击 '生成条形码' 按钮!!!");
  const all_str = ref("");
  const allArr = ref<ListType[]>([]);
  const filterateArr = ref<ListType[]>([]);
  const num = ref(0);

  // 获取服务器数据量
  function getNum() {
    http
      .fetch<string>(`http://${urlState.value.url}:8855/uuid.html`, {
        method: "GET",
        responseType: 2,
      })
      .then((res) => res.data)
      .then((res) => {
        const matches = res.match(p_regex);
        num.value = matches ? matches.length : 0;
      });
  }

  async function getList() {
    load.value = "正在请求数据！！！";
    try {
      all_str.value = await http
        .fetch<string>(`http://${urlState.value.url}:8855/uuid.html`, {
          method: "GET",
          responseType: 2,
        })
        .then((res) => res.data);
    } catch (err) {
      console.log(`🚀 ~ err:`, err);
      load.value = "请求出错！！！";
      all_str.value = "";
    }
    const matches = all_str.value.match(p_regex);
    if (all_str.value && matches) {
      load.value = "请求完成正在生成条形码！！！";
      allArr.value =
        matches.map((str) => {
          let match = str.match(k_regex);
          // 编号
          let key = match![1];
          // 编码
          const code = str!.split("=").at(-1) || "";

          const _img = textToBase64Barcode(
            // 编码
            code,
            key,
            state.value
          );
          return {
            key,
            code,
            base64: _img,
            all_content: str,
          };
        }) || [];

      filterateArr.value = JSON.parse(JSON.stringify(allArr.value));
    } else {
      load.value = "当前还没有数据！！！";
      allArr.value = [];
      filterateArr.value = [];
    }
  }

  onMounted(() => {
    setInterval(() => {
      const { isUrl, url } = urlState.value;
      if (isUrl && url) {
        getNum();
      }
    }, 10 * 1000);
  });
  return {
    getList,
    load,
    allArr,
    filterateArr,
    num,
  };
};
