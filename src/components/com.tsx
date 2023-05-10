import JsBarcode from "jsbarcode";
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
};

export function SettingPanel(opt: JsBarcode.Options): JSX.Element {
  return (
    <>
      {Object.keys(opt).map((item) => {
        const key = item as keyof JsBarcode.Options;
        return (
          <p class="flex mb-2">
            <label for={key} class="w-70px">
              {textOpt[key].text}
            </label>
            <input
              type="range"
              name={key}
              min={textOpt[key].min}
              max={textOpt[key].max}
              v-model={opt[key]}
            />
            <input
              type="number"
              class="ml-2 border-1px w-60px"
              min={textOpt[key].min}
              max={textOpt[key].max}
              v-model={opt[key]}
            />
          </p>
        );
      })}
    </>
  );
}
