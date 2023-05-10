<script setup lang="tsx">
import { ref, reactive } from "vue";
import { http } from "@tauri-apps/api";
import { textToBase64Barcode, ListType, printHtml } from "./utils";
import { SettingPanel } from "./components/com";
import { useStorage } from "@vueuse/core";

const list = ref<ListType[]>([]);
const p_regex = /(?<=<p>).*?(?=<\/p>)/g;
const k_regex = /\(([^)]+)\)/;
let load = ref("请点击 '生成二维码' 按钮");
const imgRef = ref("");
const imgObj = reactive({
  code: "",
  numCode: "",
});

const state = useStorage("barcode-store", {
  width: 2,
  height: 100,
  marginTop: 10,
  marginBottom: 10,
  marginLeft: 10,
  marginRight: 10,
});
const urlState = useStorage("url-store", {
  url: "",
  isUrl: false,
});
// http://192.168.3.121:8855/uuid.html

async function createBarCode() {
  load.value = "正在请求数据！！！";
  let data = "";
  try {
    data = await http
      .fetch<string>(urlState.value.url, {
        method: "GET",
        responseType: 2,
      })
      .then((res) => res.data);
  } catch (err) {
    console.log(`🚀 ~ err:`, err);
    load.value = "请求出错！！！";
  }
  const matches = data.match(p_regex);
  if (!matches) {
    load.value = "当前还没有数据！！！";
    return "";
  }
  list.value = [];
  load.value = "请求完成正在生成条形码！！！";
  setTimeout(() => {
    list.value = matches!.map((str) => {
      let match = str.match(k_regex);
      // 获取编号
      let result = match![1];

      const _img = textToBase64Barcode(
        // 编码
        str!.split("=").at(-1) || "",
        result,
        state.value
      );
      return {
        key: result,
        base64: _img,
        all_content: str,
      };
    });
  }, 1000);
}

function createBase64() {
  const { code, numCode } = imgObj;
  if (!code) {
    alert("请输入编码");
    return;
  }
  imgRef.value = textToBase64Barcode(code, numCode, state.value);
}
function clean() {
  imgRef.value = "";
}

function showCode() {
  urlState.value.isUrl = !urlState.value.isUrl;
  list.value = [];
  load.value = "请点击 '生成二维码' 按钮";
}

function printHtmlFn(bse64: string) {
  printHtml(bse64);
}
</script>

<template>
  <div v-if="!urlState.isUrl" class="flex justify-center items-center h-full">
    <p>
      <label for="url" class="mr-2">地址</label>
      <input
        name="url"
        class="border-1px p-1 px-4 w-400px"
        type="text"
        v-model="urlState.url"
      />
      <button @click="showCode" class="border-1px p-1 px-4 ml-1">确认</button>
    </p>
  </div>
  <div v-else class="flex p-2 box-border h-full">
    <div class="p-2 border-1px mr-1">
      <h2 class="text-center mb-2">
        配置
        <span class="text-red-400 text-xs">会在本地记录</span>
      </h2>
      <component :is="SettingPanel(state)" />
      <p class="text-center m-2" @click="createBarCode">
        <button class="border-1px py-1 px-2 mr-2" @click="showCode">
          回首页
        </button>
        <button class="border-1px py-1 px-2 bg-blue-500">生成条形码</button>
      </p>

      <div class="border-1px p-1">
        <div class="flex justify-between items-center mb-2">
          <h2>自定义生成二维码</h2>
          <div>
            <button class="border-1px px-2 bg-blue-500" @click="createBase64">
              生成
            </button>
            <button
              class="border-1px px-2 bg-blue-500"
              v-if="imgRef"
              @click="createBase64"
            >
              打印
            </button>
            <button
              class="border-1px px-2 bg-blue-500"
              v-if="imgRef"
              @click="clean"
            >
              清除
            </button>
          </div>
        </div>
        <p class="mb-1">
          <label for="num" class="mr-2">编号</label>
          <input class="border-1px" type="text" v-model="imgObj.numCode" />
        </p>
        <p class="mb-1">
          <label for="num" class="mr-2">编码</label>
          <input class="border-1px" type="text" v-model="imgObj.code" />
        </p>
        <img :src="imgRef" />
      </div>
    </div>
    <div class="p-2 border-1px box-content flex flex-col">
      <div class="mb-2">
        <div class="flex mb-1">
          <p class="mr-1">
            <label for="code" class="mr-1">编码</label>
            <input name="code" class="border-1px" type="text" />
          </p>
          <p>
            <label for="numCode" class="mr-1">序号</label>
            <input name="numCode" class="border-1px" type="text" />
          </p>
        </div>
        <div>
          <p>
            <label class="mr-1">区间查找</label>
            <input class="border-1px w-100px" type="text" />
            <span>~</span>
            <input class="border-1px w-100px" type="text" />
            <button class="border-1px px-2 ml-1">搜索</button>
          </p>
        </div>
      </div>
      <div class="bg-dark-50 text-light-50 h-full overflow-auto flex-1">
        <div v-if="list.length">
          <div v-for="(item, index) in list" :key="index" class="flex p-2">
            <div>
              <img width="480" :src="item.base64" :alt="item.key" />
              <p>{{ item.all_content }}</p>
            </div>
            <div class="flex justify-center items-center ml-2">
              <button class="border-1px px-2" @click="printHtmlFn(item.base64)">
                打印
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center flex h-full justify-center items-center">
          <span>
            {{ load }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
html,
body,
#app {
  height: 100%;
  overflow: hidden;
  position: relative;
}
</style>
