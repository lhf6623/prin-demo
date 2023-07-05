import type { BaseOptions } from "jsbarcode";
const textOpt: Record<
  string,
  {
    text: string;
    min: number;
    max: number;
  }
> = {
  width: {
    text: "条码宽度",
    min: 1,
    max: 4,
  },
  height: {
    text: "高度",
    min: 10,
    max: 150,
  },
  marginTop: {
    text: "上外间距",
    min: 0,
    max: 100,
  },
  marginBottom: {
    text: "下外间距",
    min: 0,
    max: 100,
  },
  marginLeft: {
    text: "左外间距",
    min: 0,
    max: 100,
  },
  marginRight: {
    text: "右外间距",
    min: 0,
    max: 100,
  },
  fontSize: {
    text: "字号",
    min: 0,
    max: 100,
  },
  imgWidth: {
    text: "图片宽度",
    min: 100,
    max: 1500,
  },
};

export function SettingPanel(opt: BaseOptions): JSX.Element {
  return (
    <>
      {Object.keys(opt).map((item) => {
        const key = item as keyof BaseOptions;
        const { min, max, text } = textOpt[key];
        return (
          <p class="flex mb-2">
            <label for={key} class="w-70px">
              {text}
            </label>
            <input
              type="range"
              name={key}
              min={min}
              max={max}
              v-model={opt[key]}
            />
            <input
              type="number"
              class="ml-2 border-1px w-60px"
              min={min}
              max={max}
              v-model={opt[key]}
            />
          </p>
        );
      })}
    </>
  );
}
